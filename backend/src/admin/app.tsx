import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'cs',
       'sk',
       'uk',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
