
class Transaction {
   transactionId = '';
   timestamp = Date.now();
   #feePercent = 0.6;

  constructor(sender, recipient, funds = 0.0, description = 'Generic') {
    this.sender = sender;
    this.recipient = recipient;
    this.funds = Number(funds);
    this.description = description;
    this.transactionId = this.calculateHash();
  }

  displayTransaction() {
    return `Transaction ${this.description} from ${this.sender} to 
       ${this.recipient} for ${this.funds}`;
  }
 
  get netTotal() {
     return  Transaction.#precisionRound(
        this.funds * this.#feePercent, 2);
  }
 
  static #precisionRound(number, precision) {
     const factor = Math.pow(10, precision);
     return Math.round(number * factor) / factor;
  }
}
 
Object.assign(
   Transaction.prototype,
   HasHash(['timestamp', 'sender', 'recipient', 'funds']),
   HasSignature(['sender', 'recipient', 'funds']),
   HasValidation()
)

/*----------------------------------------------------------------------------*/
// Mixins

const DEFAULT_ALGO_SHA256 = 'SHA256'; 
const DEFAULT_ENCODING_HEX = 'hex';
 
const HasHash = (
  keys,
  options = { algorithm: DEFAULT_ALGO_SHA256,
              encoding:  DEFAULT_ENCODING_HEX }
) => ({
  calculateHash () {
      const data = keys.map(f => this[f]).join('');
      let hash = 0, i = 0;
      while (i < data.length) {
          hash = ((hash << 5) - hash + data.charCodeAt(i++)) << 0;
      }
      return hash**2;
  }
})


const DEFAULT_SIGN_ALGO = 'RSA-SHA256';
 
const HasSignature = (
    keys,
    options = {
        algorithm: DEFAULT_SIGN_ALGO,
        encoding: DEFAULT_ENCODING_HEX
    }) =>
      ({
          generateSignature(privateKey) {
              //...
          },
          verifySignature(publicKey, signature) {
              //...
          }
      });

const HasValidation = () => ({
    //...
});


