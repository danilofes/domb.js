let currentTransaction: Transaction | null = null;

export type Task = () => void;

export interface ITransaction {
  doOnCommit(task: Task): void;
}

export function inTransaction(task: (transaction: Transaction) => void) {
  if (currentTransaction == null) {
    currentTransaction = new Transaction();
    task(currentTransaction);
    currentTransaction.commit();
    currentTransaction = null;
  } else {
    task(currentTransaction);
  }
}

export function onCommitTransaction(task: Task) {
  inTransaction(tx => tx.doOnCommit(task));
}

class Transaction implements ITransaction {

  private tasks: Task[] = [];

  doOnCommit(task: Task): void {
    this.tasks.push(task);
  }

  commit() {
    for (const task of this.tasks) {
      task();
    }
    this.tasks = [];
  }

}