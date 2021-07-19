import AppHelper from '../src/helpers/AppHelper';
import {Container} from 'typedi';
const appHelper = Container.get(AppHelper);

it('check packages as boolean', async () => {
  const requiredPackages = new Map([['react-native', '0.61.1'], ['react', '16.9.0']]);
  //const appHelper = new AppHelper();
  const result = await appHelper.checkPackages(requiredPackages, true);
  expect(result).toBe(false);
});

it('check packages as boolean, without versions', async () => {
  const requiredPackages = new Map([ ['lodash', ''] ]);
  // const appHelper = new AppHelper();
  const result = await appHelper.checkPackages(requiredPackages, true);
  expect(result).toBe(true);
});

it('is higher version', () => {
  const appHelper = new AppHelper();
  expect(appHelper.isHigherVersion('4.5', '4.3')).toBe(true);
});

it('get filename to compress with subdomain', () => {
  const setup = {
    name: 'my_company',
    protocol: 'ssh',
    domain: 'company.com',
    subdomain: 'reactjs',
    user: 'web',
    host: '127.0.0.1',
    path: '/var/www'
  };

  //const appHelper = new AppHelper();
  const filename = appHelper.getFilenameToCompress(setup);
  console.log(filename);
  expect(filename).toBe('');
});
