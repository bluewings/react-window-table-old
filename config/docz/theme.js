export default {
  colors: {
    // primary: 'tomato',
    // primary: '#6d4c41',
    // primary: '#7cb342',
    primary: '#1e88e5',
    blue: '#1e88e5',
    link: '#1e88e5',
  },
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: 0,
      '&:before': {
        height: '3px !important',
        // backgroundColor: 'yellow',
      },

    },
    h2: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 0,
    },
    // wrapper: {
    //   background: 'yellow !important',
    //   '&:before': {
    //     height: '3px !important',
    //     backgroundColor: 'yellow',
    //   },
    // },
    paragraph: {
      fontSize: 16,
      lineHeight: 1.5,
      background: 'yellow',
    },
    // h1: {
    //   fontSize: 100,
    // },
    table: {
      // overflowY: ['hidden', 'hidden', 'hidden', 'initial'],
      // display: ['block', 'block', 'block', 'table'],
      // width: '100%',
      // marginBottom: [20, 40],
      // fontFamily: '"Source Code Pro", monospace',
      // fontFamily: 'Roboto,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,sans-serif',
      fontSize: 16,
      borderRadius: 0,
      // background: 'yellow',
      thead: {
        th: {
          padding: '0.5rem 0.75rem',
        },
      },
      tbody: {
        // th: {
        //   padding: '0.75rem',
        // },
        td: {
          padding: '0.5rem 0.75rem',
        },
      },

    },
    body: {
      fontFamily: 'Roboto,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,sans-serif',
      '#root > div > div > nav': {
        div: {
          marginTop: '0 !important',
        },
        a: {
          // background: 'yellow',
          boxSizing: 'border-box',
          // border: '1px solid black',
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
            // width: 4px;
            // bottom: 0;
            // height: 40px;
          },
        },
      },

      '.react-live-preview': {
        // border: '5px solid black',
        fontSize: 12,
        '.cell': {
          // fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

      },
      '.example': {
        fontSize: 12,
        '.cell': {
          // fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  },
};
