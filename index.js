const axios = require('axios');
require('dotenv').config();

const products = [];

const login = () => {
  return axios.post(`https://course-ec-api.hexschool.io/api/auth/login`, {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  }).then((resp) => {
    return resp.data.token
  })
}
// Math.random should be unique because of its seeding algorithm.
// Convert it to base 36 (numbers + letters), and grab the first 9 characters
// after the decimal.
const ID =  () => Math.random().toString(36).substr(2, 9);

const getRandomComment = () => {
  const json = require('./comment.json');
  const randomNum = (max) => Array.from({length: max}).map((_, i) => i).sort(() => Math.random() - .5)[0]
  return [...Object.keys(json)]
    .map((el) => json[el][randomNum(json[el].length - 1)])
    .reduce((pre, cur) => `${pre}${cur}`, '');
}

const getRandomPhoto = () => {
  const sex = ['men', 'women', 'lego'];
  const sexR = Math.floor(Math.random() * 2);
  let r;
  switch (sex[sexR]) {
    case 'men':
    case 'women':
      r = Math.floor(Math.random() * 99);
      break;
    case 'lego':
      r = Math.floor(Math.random() * 9);
  }  
  return `https://randomuser.me/api/portraits/med/${sex[sexR]}/${r}.jpg`
}

const getProductsID = async () => {
  try {
    const resp = await axios.get(`${process.env.API}${process.env.UUID}/ec/products`);
    const { data } = resp.data;
    data.forEach((el) => {
      products.push(el.id);
    });
  } catch (e) {
    console.log(e);
  }
};

const getSpecificProduct = async (product) => {
  const resp = await axios.get(`${process.env.API}${process.env.UUID}/ec/product/${product}`);
  const { data } = resp.data;
  data.options = JSON.parse(data.options);
  data.options.feeback = Array
    .from({ length: Math.floor(Math.random() * (6 - 2)) + 2 })
    .map(() => ({
      id: ID(),
      star: 5,
      comment: getRandomComment(),
      pic: getRandomPhoto(),
    }))
  data.options.feeback = data.options.feeback.map((el) => {
    el.pic = getRandomPhoto()
    return el;
  })
  // console.log(data.options.feeback);
  data.options = JSON.stringify(data.options);
  updateData(product, data);
}

const updateData = async (id, data) => {
  try {
    const resp = await axios.patch(`${process.env.API}${process.env.UUID}/admin/ec/product/${id}`, {
      ...data
    });
    if (resp.status === 200) {
      console.log(id, 'update done!');
    }
  } catch (e) {
    console.log(e);
    console.log('error', id);
  }
}

const getData = async (index, product) => {
  const resp = await axios.get(`${process.env.API}${process.env.UUID}/ec/product/${product}`);
  // console.log(`${index}: `, resp.data.data);
}

const main = async () => {
  let token = await login();
  await getProductsID();
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
  products.forEach((item, index) => {
    getSpecificProduct(item);
    setTimeout(() => {
      getData(index, item);
    }, 5000)
  })
}

main();