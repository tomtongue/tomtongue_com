/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

module.exports = {
    title: 'tomtongue.com',
    tagline: '👨🏻‍💻Need More Caffein👩🏻‍💻',
    url: 'https://tomtongue.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    favicon: 'img/favicon.ico',
    organizationName: 'tomtongue', // Usually your GitHub org/user name.
    projectName: 'tomtongue_com', // Usually your repo name.
    onBrokenLinks: 'warn',
    themeConfig: {
      prism: {
        additionalLanguages: ['java', 'scala', 'swift', 'rust', 'ruby', 'python'],
      },
      navbar: {
        hideOnScroll: true,
        title: 'Tomtongue',
        logo: {
          alt: 'tomtongue',
          src: 'img/logo.png',
        },
        items: [
          {to: 'blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/tomtongue/tomtongue_com',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      colorMode: {
        respectPrefersColorScheme: true,
        switchConfig: {
          darkIcon: '●',
          lightIcon: '○'
        }
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Contents',
            items: [],
          },
          {
            title: 'Blog',
            items: [
              {
                label: 'Blog posts',
                to: '/blog',
              },
              {
                label: 'Tags',
                to: '/blog/tags',
              }
            ],
          },
          {
            title: 'About Me',
            items: [
              {
                label: 'GitHub - tomtongue',
                to: 'https://github.com/tomtongue',
              },
              {
                label: 'LinkedIn',
                to: 'https://www.linkedin.com/in/tomohiro-tanaka-bb186039/',
              },
            ],
          }
        ],
        // Please do not remove the credits, help to publicize Docusaurus :)
        copyright: `Copyright © ${new Date().getFullYear()} tomtonguecom`,
      },
    },
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          docs: {
            // It is recommended to set document id as docs home page (`docs/` path).
            sidebarPath: require.resolve('./sidebars.js'),
            // Please change this to your repo.
            editUrl:
              'https://github.com/tomtongue/tomtongue_com',
          },
          blog: {
            showReadingTime: true,
            editUrl:
              'https://github.com/tomtongue/tomtongue_com/edit/master/website/blog/',
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        },
      ],
    ],
  };
  