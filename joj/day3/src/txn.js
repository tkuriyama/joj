
/*----------------------------------------------------------------------------*/
// Txn

const Transaction = {
   init(sender, recipient, funds = 0.0) {
     const _feePercent = 0.6;

     this.sender = sender;
     this.recipient = recipient;
     this.funds = Number(funds);

     this.netTotal = function() {
       return _precisionRound(this.funds * _feePercent, 2);
     }

     function _precisionRound(number, precision) {
       const factor = Math.pow(10, precision);
       return Math.round(number * factor) / factor;
     }
     return this;
   },

   displayTransaction() {
     return `Transaction from ${this.sender} to ${this.recipient} for ${this.funds}`;
   }
}

// Hash Txn

const HashTransaction = Object.create(Transaction);


HashTransaction.init = function init(sender, recipient, funds) {
    Transaction.init.call(this, sender, recipient, funds);
    this.transactionId = this.calculateHash();
    return this;
}

HashTransaction.calculateHash = function calculateHash() {
    const data = [
        this.sender,
        this.recipient,
        this.funds
    ].join('');
    let hash = 0, i = 0;
    while (i < data.length) {
        hash = ((hash << 5) - hash + data.charCodeAt(i++)) << 0;
    }
    return hash**2;
}

HashTransaction.displayTransaction = function displayTransaction () {
    return `${this.transactionId}: ${Transaction.displayTransaction.call(this)}`;
}

/*----------------------------------------------------------------------------*/
// test

const tx = Object.create(HashTransaction)
      .init('luis@tjoj.com', 'luke@tjoj.com', 10);

console.log(tx.displayTransaction());

// Prints:
// 64284210552842720: Transaction from luis@tjoj.com to luke@tjoj.com for 10
