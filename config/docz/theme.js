const themeConfig = {
  colors: {
    primary: '#1e88e5',
    link: '#1e88e5',
  },
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: 0,
      '&:before': {
        height: '3px !important',
      },
    },
    h2: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 1.5,
      background: 'yellow',
    },
    table: {
      fontSize: 16,
      borderRadius: 0,
      'thead th, tbody td': {
        padding: '0.5rem 0.75rem',
        lineHeight: 1.5,
      },
    },
    body: {
      fontFamily: 'Roboto,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,sans-serif',
      '#root > div > div > nav': {
        div: {
          marginTop: '0 !important',
        },
        a: {
          boxSizing: 'border-box',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: '34px',
          height: 36,
          paddingTop: 0,
          paddingBottom: 0,
          '&.active': {
            fontWeight: 800,
            '&:before': {
              top: 6,
              width: 3,
              height: 24,
            },
          },
        },
      },
      '.react-live-preview, .example': {
        fontSize: 12,
        '.cell': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  },
};

const htmlContext = {
  head: {
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto:400,500,700' },
    ],
  },
};

export { themeConfig, htmlContext };
