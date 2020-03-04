const test = require('ava');

const StdOutput = require('../../lib/output/std');
const Url = require('url');
const QueryString = require('querystring');

test('config', t => {
  function makeOpts(src){
    let url = Url.parse(src);
    url.params = QueryString.parse(url.query);
    return url;
  }

  t.is((StdOutput.parseUrl(makeOpts('std://out'))).fd, 1);
  t.is((StdOutput.parseUrl(makeOpts('std://out?asdkmasld=qweqw'))).fd, 1);

  t.is((StdOutput.parseUrl(makeOpts('std://err'))).fd, 2);
  t.is((StdOutput.parseUrl(makeOpts('std://err?asdkmasld=qweqw'))).fd, 2);

  t.is((StdOutput.parseUrl(makeOpts('std://123'))).fd, 123);
  t.is((StdOutput.parseUrl(makeOpts('std://123?asdkmasld=qweqw'))).fd, 123);

  t.throws(() => {
    StdOutput.parseUrl(makeOpts('std://asdkmasld=qweqw'));
  });
});
