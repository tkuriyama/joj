
const MyStore = {
   init(element) {
      this.length = 0;
      this.push(element);
   },
   push(b) {
      this[this.length] = b;
      return ++this.length;
   }
}

const Blockchain = Object.create(MyStore);

// the "instance" of Blockchain object, delegating methods
const chain = Object.create(Blockchain);
chain.init(createGenesisBlock);
chain.push(new Block(...));
chain.length; // 2

