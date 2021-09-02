const Transaction = {
  init(sender, recipient, funds = 0.0) {
    this.sender = sender;
    this.recipient = recipient;
    this.funds = Number(funds);
    return this;
  },
  displayTransaction() {
    return `Transaction from ${this.sender} to ${this.recipient} for
       ${this.funds}`;
  }
}

const HashTransaction = Object.assign(
  Object.create(Transaction),
  {
      calculateHash() {
        const data = [this.sender, this.recipient, this.funds].join('');
        let hash = 0, i = 0;
        while (i < data.length) {
          hash = ((hash << 5) - hash + data.charCodeAt(i++)) << 0;
        }
        return hash**2; 
      },
      displayTransaction() {
          return `${this.calculateHash()}: ${Transaction.displayTransaction.call(this)}`;
      }
  }
);


const tx = Object.create(HashTransaction)
      .init('luis@tjoj.com', 'luke@tjoj.com', 10);

console.log(tx.displayTransaction());

// Prints:
// 64284210552842720: Transaction from luis@tjoj.com to luke@tjoj.com for 10
