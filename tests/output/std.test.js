const StdOutput = require('../../lib/output/std');
const Url = require('url');
const QueryString = require('querystring');

describe('std output', () => {
  test('config', () => {
    function makeOpts(src){
      let url = Url.parse(src);
      url.params = QueryString.parse(url.query);
      return url;
    }

    expect(StdOutput.parseUrl(makeOpts('std://out'))).toHaveProperty('fd', 1);
    expect(StdOutput.parseUrl(makeOpts('std://out?asdkmasld=qweqw'))).toHaveProperty('fd', 1);

    expect(StdOutput.parseUrl(makeOpts('std://err'))).toHaveProperty('fd', 2);
    expect(StdOutput.parseUrl(makeOpts('std://err?asdkmasld=qweqw'))).toHaveProperty('fd', 2);

    expect(StdOutput.parseUrl(makeOpts('std://123'))).toHaveProperty('fd', 123);
    expect(StdOutput.parseUrl(makeOpts('std://123?asdkmasld=qweqw'))).toHaveProperty('fd', 123);

    expect(() => StdOutput.parseUrl(makeOpts('std://asdkmasld=qweqw'))).toThrow();
  });
});
