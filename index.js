const { baiduTran } = require('./client/baiduTran');
baiduTran().then(({ body }) => {
  console.log(body);
});
