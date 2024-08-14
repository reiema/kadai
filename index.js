const express = require('express');
const app = express();
const path = require('node:path');
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.json());

const logMiddleware = (req, res, next) => {
  console.log(req.method, req.path);
  next();
};

app.get('/user/:id', logMiddleware, (req, res) => {
  // :idをreq.params.idとして受け取る
  res.status(200).send(req.params.id);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

async function main() {
  await client.connect();

  const db = client.db('my-app');
  const productsCollection = db.collection('products'); // 商品名と金額が記録されているデータベース1
  const cartCollection = db.collection('cart'); // 商品名と金額が記録されるデータベース2

  // 初期のデータベース1に商品と金額を追加（初回のみ）
  await productsCollection.insertMany([
    { name: 'ルーレット', price: 500 },
    { name: 'ミニツイン', price: 700 },
    { name: 'ツイン', price: 900 },
    { name: 'フラッグ', price: 1000 },
    { name: 'ペンライト', price: 3500 },
    { name: 'レインコート', price: 700 },
  ]);

  // ホームページの表示
  app.get('/', async (req, res) => {
    try {
      const products = await productsCollection.find().toArray();
      res.render(
        path.join(__dirname, 'views', 'index.ejs'),
        { products: products }
      );
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
    }
  });

  // 商品をデータベース2（カート）に追加
  app.post('/api/cart', async (req, res) => {
    const productName = req.body.name;
    if (!productName) {
      res.status(400).send('Bad Request: name is required');
      return;
    }

    const product = await productsCollection.findOne({ name: productName });
    if (!product) {
      res.status(404).send('Product not found');
      return;
    }

    await cartCollection.insertOne({ name: product.name, price: product.price });
    res.status(200).send('Product added to cart');
  });

  // データベース2の合計金額を計算
  app.get('/api/cart/total', async (req, res) => {
    const cartItems = await cartCollection.find().toArray();
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    res.status(200).json({ total });
  });

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

main().catch(console.error);