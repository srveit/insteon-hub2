'use strict';
const unroll = require('unroll');

unroll.use(it);

const {commandResponseMatcher} = require('../lib/encodeCommand');

describe('commandResponseMatcher', () => {
  describe('with matching response', () => {
    unroll(
      '#response should match #command',
      testArgs => {
        const matcher = commandResponseMatcher(testArgs.command);
        expect(matcher(testArgs.response)).toBe(true);
      },

      [
        ['command', 'response'],
        [
          {command: 'Get IM Info'},
          {command: 'Get IM Info', ack: true}
        ],
        [
          {command: 'Get IM Info'},
          {command: 'Get IM Info', ack: false}
        ],
        [
          {command: 'Send ALL-Link Command'},
          {command: 'Send ALL-Link Command'}
        ],
        [
          {command: 'Send INSTEON Standard-length Message'},
          {command: 'Send INSTEON Standard-length Message'}
        ],
        [
          {command: 'Send INSTEON Extended-length Message'},
          {command: 'Send INSTEON Extended-length Message'}
        ],
        [
          {command: 'Start ALL-Linking'},
          {command: 'Start ALL-Linking'}
        ],
        [
          {command: 'Cancel ALL-Linking'},
          {command: 'Cancel ALL-Linking'}
        ],
        [
          {command: 'Set Host Device Category'},
          {command: 'Set Host Device Category'}
        ],
        [
          {command: 'Reset the IM'},
          {command: 'Reset the IM'}
        ],
        [
          {command: 'Set INSTEON ACK Message Byte'},
          {command: 'Set INSTEON ACK Message Byte'}
        ],
        [
          {command: 'Get First ALL-Link Record'},
          {command: 'ALL-Link Record Response'}
        ],
        [
          {command: 'Get First ALL-Link Record'},
          {command: 'Get First ALL-Link Record', ack: false}
        ],
        [
          {command: 'Get Next ALL-Link Record'},
          {command: 'ALL-Link Record Response'}
        ],
        [
          {command: 'Get Next ALL-Link Record'},
          {command: 'Get Next ALL-Link Record', ack: false}
        ],
        [
          {command: 'Set IM Configuration'},
          {command: 'Set IM Configuration'}
        ],
        [
          {command: 'Get ALL-Link Record for Sender'},
          {command: 'ALL-Link Record Response'}
        ],
        [
          {command: 'Get ALL-Link Record for Sender'},
          {command: 'Get ALL-Link Record for Sender', ack: false}
        ],
        [
          {command: 'IM LED On'},
          {command: 'IM LED On'}
        ],
        [
          {command: 'IM LED Off'},
          {command: 'IM LED Off'}
        ],
        [
          {command: 'Set INSTEON NAK Message Byte'},
          {command: 'Set INSTEON NAK Message Byte'}
        ],
        [
          {command: 'Set INSTEON ACK Message Two Bytes'},
          {command: 'Set INSTEON ACK Message Two Bytes'}
        ],
        [
          {command: 'RF Sleep'},
          {command: 'RF Sleep'}
        ],
        [
          {command: 'Get IM Configuration'},
          {command: 'Get IM Configuration'}
        ],
        [
          {command: 'Cancel Cleanup'},
          {command: 'Cancel Cleanup'}
        ],
        [
          {command: 'Read 8 bytes from Database'},
          {command: 'Database Record Found'}
        ],
        [
          {command: 'Read 8 bytes from Database'},
          {command: 'Read 8 bytes from Database', ack: false}
        ],
        [
          {command: 'Beep IM'},
          {command: 'Beep IM'}
        ],
        [
          {command: 'Set Status'},
          {command: 'Set Status'}
        ],
        [
          {command: 'Set Database Link Data for next Link'},
          {command: 'Set Database Link Data for next Link'}
        ],
        [
          {command: 'Set Application Retries for New Links'},
          {command: 'Set Application Retries for New Links'}
        ],
        [
          {command: 'Set RF Frequency Offset'},
          {command: 'Set RF Frequency Offset'}
        ],
        [
          {command: 'Set RF Frequency Offset'},
          {command: 'Set RF Frequency Offset'}
        ],
        [
          {command: '7F Command'},
          {command: '7F Command'}
        ]
      ]
    );
  });

  describe('with non-matching response', () => {
    unroll(
      '#response should not match #command',
      function (testArgs) {
        const matcher = commandResponseMatcher(testArgs.command);
        expect(matcher(testArgs.response)).toBe(false);
      },

      [
        ['command', 'response'],
        [
          {command: 'Get IM Info'},
          {command: 'IM LED On', ack: true}
        ],
        [
          {command: 'Get First ALL-Link Record'},
          {command: 'Get First ALL-Link Record', ack: true}
        ],
        [
          {command: 'Get Next ALL-Link Record'},
          {command: 'Get Next ALL-Link Record', ack: true}
        ],
        [
          {command: 'Get ALL-Link Record for Sender'},
          {command: 'Get ALL-Link Record for Sender', ack: true}
        ],
        [
          {command: 'Read 8 bytes from Database'},
          {command: 'Read 8 bytes from Database', ack: true}
        ]
      ]
    );
  });
});
