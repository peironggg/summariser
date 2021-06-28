import yahooFinance from 'yahoo-finance2';

export const div = () => {
  yahooFinance
    .historical('D05.SI', { period1: '2019-6-1', events: 'div' }, { validateResult: false })
    .then((res) => console.log(res));
};
