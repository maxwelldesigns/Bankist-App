'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  type: 'premium',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  type: 'standard',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  type: 'premium',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  type: 'basic',
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Transactions
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i, movs) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
       <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const totalAmountInBank = accounts.reduce(function () {});

// Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} €`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

//
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.at(0))
      .join('');
  });
};

createUsernames(accounts);
// console.log(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Event Handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value,
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display ui and message
    labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);

    console.log('Login');
  } else {
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value,
  );
  console.log(amount, receiverAccount);
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    console.log('Transfer successful');
    console.log(currentAccount.movements, receiverAccount.movements);

    // Update UI
    updateUI(currentAccount);
  } else console.log("can't do that bub");
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username,
    );
    console.log(index);

    // delete user
    accounts.splice(index, 1);

    // hide ui
    containerApp.style.opacity = 0;
  }
  inputLoginUsername.value = inputLoginPin.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update ui
    updateUI(currentAccount);

    // Clear input field
    inputLoanAmount.value = '';
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// // LECTURES

// // const currencies = new Map([
// //   ['USD', 'United States dollar'],
// //   ['EUR', 'Euro'],
// //   ['GBP', 'Pound sterling'],
// // ]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// /////////////////////////////////////////////////

// let arr = ['a', 'b', 'c', 'd', 'e'];

// // SLICE
// console.log(arr.slice(2));
// console.log(arr.slice(2, 4));
// console.log(arr.slice(-2));
// console.log(arr.slice(-1));
// console.log(arr.slice(1, -2));
// console.log(arr.slice()); // creating a shallow copy. Same as [...arr]

// // SPLICE
// // console.log(arr.splice(2)); // mutates original array. Used to delete elements of an array
// arr.splice(-1);
// console.log(arr);
// arr.splice(1, 2); // the second parameter is the delete count
// console.log(arr);

// // REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse()); // mutates original array
// console.log(arr2);

// // CONCAT
// const letters = arr.concat(arr2); // concatinating 2 arrays / combininb 2 arrays / same as [...arr, ...arr2]
// console.log(letters);

// // JOIN
// console.log(letters.join(' - '));

// // THE NEW AT METHOD
// arr = [23, 11, 64];
// console.log(arr[0]);
// console.log(arr.at(0));

// // Getting the last elements of an array
// console.log(arr[arr.length - 1]);
// console.log(arr.slice(-1)[0]);
// console.log(arr.at(-1));

// console.log('jonas'.at(0));

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // for (const movement of movements) { // looping over each element/variable
// for (const [i, movement] of movements.entries()) {
//   // looping over each index(counter) and element/variable
//   if (movement > 0) {
//     // console.log(`You deposited ${movement}`);
//     console.log(`Movement ${i + 1}: You deposited ${movement}`);
//   } else {
//     console.log(`Movemnet ${i + 1}: You withdrew ${Math.abs(movement)}`);
//   }
// }

// console.log('------- FOREACH -------');

// movements.forEach(function (movement, index, array) {
//   // the names don't matter but the order does
//   if (movement > 0) {
//     console.log(`Movement ${index + 1}: You deposited ${movement}`);
//   } else {
//     console.log(`Movemnet ${index + 1}: You withdrew ${Math.abs(movement)}`);
//   }
// });
// // 0: function(200)
// // 1: function(450)
// // 2: function(-450)
// // etc

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (val, key, map) {
//   console.log(`${key}: ${val}`);
// });

// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
// console.log(currenciesUnique);

// currenciesUnique.forEach(function (val, _, set) {
//   // sets do not have keys therefore the second parameter is the same as the value if written  // _ means a throwaway variable/a completely unnecessary variable
//   console.log(`${_}: ${val}`);
// });

// // Challenge 1

// const julia = [3, 5, 2, 12, 17];
// const kate = [4, 1, 15, 8, 3];

// const checkDogs = function (arr1, arr2) {
//   arr1.forEach(function (dog, i, dogs) {
//     const ages1 =
//       dog < 3
//         ? `Dog ${i + 1}: This dog of ${dog} years is still a puppy 🐶`
//         : `Dog ${i + 1}: This dog of ${dog} years is an adult`;

//     console.log(ages1);
//   });

//   console.log('--------- VS ---------');

//   arr2.forEach(function (dog, i, dogs) {
//     const ages2 =
//       dog < 3
//         ? `Dog ${i + 1}: This dog of ${dog} years is still a puppy 🐶`
//         : `Dog ${i + 1}: This dog of ${dog} years is an adult`;

//     console.log(ages2);
//   });
// };

// // checkDogs(julia, kate);

// const juliaCopy = julia.slice(1, -2);
// console.log(juliaCopy);

// const combinedDogs = juliaCopy.concat(kate);
// console.log(combinedDogs);

// checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
// console.log('--------- combined ---------');
// // checkDogs(combinedDogs);

// // THE MAP METHOD

// const eurToUsd = 1.1;

// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
// });

// const movementsUSDarrow = movements.map(mov => mov * eurToUsd);
// console.log(movementsUSDarrow);

// console.log(movements);
// console.log(movementsUSD);

// const movementsUSDfor = [];
// for (const mov of movements) {
//   movementsUSDfor.push(mov * eurToUsd);
// }
// console.log(movementsUSDfor);

// const movementsDescriptions = movements.map(
//   (mov, i) =>
//     `Movemnet ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(mov)}`,
// );

// console.log(movementsDescriptions);

// // THE FILTER METHOD

// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// });

// console.log(movements);
// console.log(deposits);

// const withdrawals = movements.filter(mov => mov < 0);
// console.log(withdrawals);

// console.log(movements);
// const balance = movements.reduce(function (acc, cur, i, arr) {
//   // accumulator is like a snowball
//   console.log(`iteration ${i + 1}: ${acc}`);
//   return acc + cur;
// }, 0);
// console.log(balance);

// // Doing the same thing with an arrow function
// const snowball = movements.reduce((acc, cur) => acc + cur, 0);
// console.log(snowball);

// // Doing the same thing manually with a for loop
// let acc = 0;
// for (const mov of movements) acc += mov;
// console.log(acc);

// // Getting the maximum value of the movement
// const maxValue = movements.reduce(function (max, cur) {
//   console.log(max, cur);
//   return max > cur ? max : cur;
// }, movements.at(0));

// console.log(maxValue);

// // Coding Challenge 2

// // Function for calculating average human age
// // const calcAverageHumanAge = function (dogAges) {
// //   const dogHumanAges = dogAges
// //     .map(function (dogAge) {
// //       return dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4;
// //     })
// //     .filter(function (cur) {
// //       return cur >= 18;
// //     });

// //   const average = dogHumanAges.reduce(function (acc, cur, i, arr) {
// //     return acc + cur / arr.length;
// //   }, 0); /*dogHumanAges.length*/

// //   return average;
// // };

// // const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// // console.log(avg1);

// // const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// // console.log(avg2);

// // The magic of chaning methods
// const totalDepositsUSD = movements
//   .filter(mov => mov > 0)
//   .map((mov, i, arr) => {
//     console.log(arr); // logging the arr parameter helps debud by checking if the filter method produce the array we intended it to
//     return mov * eurToUsd;
//   })
//   // .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

// // Coding challenge 3

// const calcAverageHumanAge = dogAges =>
//   dogAges
//     .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))

//     .filter(cur => cur >= 18)
//     .reduce(
//       (acc, cur, i, arr) => acc + cur / arr.length,
//       0,
//     ); /*dogHumanAges.length*/

// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// console.log(avg1);

// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg2);

// // The Find Method

// const firstWithdrawal = movements.find(mov => mov < 0);

// console.log(movements);
// console.log(firstWithdrawal);

// console.log(accounts);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

// // using for of
// for (const acc of accounts) {
//   if (acc.owner === 'Jessica Davis') console.log(acc);
//   else console.log('');
// }

// The findlast & findlastindex methods
// console.log(movements);

// const lastWithdrawal = movements.findLast(mov => mov < 0);
// console.log(lastWithdrawal);

// // 'Your latest large movement was ${x} movements ago';

// const lastLargeMovements = function (movments) {
//   const lastMov = movements.findLast(mov => Math.abs(mov) > 1000);
//   const lastMovInd = movements.findLastIndex((mov, i) => Math.abs(mov) > 1000);
//   console.log(lastMov, lastMovInd);
//   console.log(
//     `Your latest large movement: ${lastMov} was ${movements.length - lastMovInd} ${movements.length - lastMovInd > 1 ? 'movements' : 'movement'} ago`,
//   );
// };

// lastLargeMovements(movements);

// The some and every methods
//Some

// console.log(movements);

// // Equality
// console.log(movements.includes(-130)); // We can only test for equality using the includes method but if we want to test for a condition we use some

// // Condition
// const anyDeposit = movements.some(mov => mov > 0 /*/ 100 /5000*/); // testing for any deposit
// console.log(anyDeposit);

// // Every
// console.log(movements.every(mov => mov > 0 /*/ 100 /5000*/));
// console.log(account4.movements.every(mov => mov > 0 /*/ 100 /5000*/));

// // Separate callback
// const deposit = mov => mov > 0;
// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

// // The flat method
// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat());

// const arrDeep = [[[1, 2], 3], [4, 5, [6]], 7, 8];
// console.log(arr.flat(2));

// const accountsMovements = accounts.map(acc => acc.movements);
// console.log(accountsMovements);

// const allMovements = accountsMovements.flat();
// console.log(allMovements);

// const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

// // The flatMap Method
// const overallBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance2);

// Challenge 4

// const breeds = [
//   {
//     breed: 'German Shepherd',
//     averageWeight: 32,
//     activities: ['fetch', 'swimming'],
//   },
//   {
//     breed: 'Dalmatian',
//     averageWeight: 24,
//     activities: ['running', 'fetch', 'agility'],
//   },
//   {
//     breed: 'Labrador',
//     averageWeight: 28,
//     activities: ['swimming', 'fetch'],
//   },
//   {
//     breed: 'Beagle',
//     averageWeight: 12,
//     activities: ['digging', 'fetch'],
//   },
//   {
//     breed: 'Husky',
//     averageWeight: 26,
//     activities: ['running', 'agility', 'swimming'],
//   },
//   {
//     breed: 'Bulldog',
//     averageWeight: 36,
//     activities: ['sleeping'],
//   },
//   {
//     breed: 'Poodle',
//     averageWeight: 18,
//     activities: ['agility', 'fetch'],
//   },
// ];

// // Average weight of huskies
// const huskyAverageWeight = function (arr) {
//   const husky = arr.find(dog => dog.breed === 'Husky');

//   console.log(husky.averageWeight);
// };
// huskyAverageWeight(breeds);
// //  breeds.at(5).averageWeight;

// // Only breed that likes both running and fetch
// const dogBothActivities = function (arr) {
//   const expectedDog = arr.find(function (dog) {
//     return (
//       dog.activities.includes('running') && dog.activities.includes('fetch')
//     );
//   });

//   const name = expectedDog.breed;
//   console.log('only breed', name);
// };

// dogBothActivities(breeds);

// // All activities
// const allActivities = breeds.flatMap(breed => breed.activities);
// console.log('all dog activities', allActivities);

// // Unique activities
// const uniqueActivities = [...new Set(allActivities)];
// console.log('unique activities', uniqueActivities);

// // Activities other than swimming
// const swimmingAdjacent = function (arr) {
//   const dogsThatSwim = arr.filter(function (dog) {
//     return dog.activities.includes('swimming');
//   });
//   const flatActivities = dogsThatSwim.flatMap(obj => obj.activities);

//   const uniqueSwimmingIncludedActivities = new Set(flatActivities);

//   const uniqueSwimmingIncludedActivitiesArr = [
//     ...uniqueSwimmingIncludedActivities,
//   ].filter(activity => activity !== 'swimming');
//   console.log('swimming adjacent', uniqueSwimmingIncludedActivitiesArr);
// };

// swimmingAdjacent(breeds);

// // Dog average > 10 ?
// const dogAverages = function (arr) {
//   const averages = arr.map(breed => breed.averageWeight);

//   const average = averages.reduce(
//     (acc, avg, i, arr) => acc + avg / arr.length,
//     0,
//   );

//   console.log(averages);
//   console.log(average);

//   if (average >= 10) {
//     console.log('dogAvg > 10?', true);
//   } else {
//     console.log('dogAvg > 10?', false);
//   }
// };

// dogAverages(breeds);

// // Active dogs
// const activeDogs = function (arr) {
//   const dogsWith3OrMore = arr.some(function (dog) {
//     return dog.activities.length >= 3;
//   });

//   if (dogsWith3OrMore) {
//     console.log('3 or more', true);
//   } else {
//     console.log('3 or more', false);
//   }
// };

// activeDogs(breeds);

// // Bonus

// const averageWeightOfHeaviestFetchBreed = function (arr) {
//   const dogsThatLikeToFetch = arr.filter(dog =>
//     dog.activities.includes('fetch'),
//   );
//   console.log(dogsThatLikeToFetch);

//   const flat = dogsThatLikeToFetch.flatMap(dog => dog.averageWeight);
//   console.log(flat);

//   const heaviestAverageWeight = Math.max(...flat);
//   console.log(heaviestAverageWeight);
// };

// averageWeightOfHeaviestFetchBreed(breeds);

// console.log(`da best`);

// Sorting Arrays

// Strings
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); // mutates original array

// // Numbers
// console.log(movements);
// // console.log(movements.sort());

// // Sort callback function

// // return '' < 0, A,B (keep order)
// // return '' > 0, B,A (switch order)

// // Ascending order
// // movements.sort((a, b) => {
// //   if (a > b) return 1;
// //   if (a < b) return -1;
// // });

// // OR

// movements.sort((a, b) => a - b);
// console.log(movements);

// // Descending order
// // movements.sort((a, b) => {
// //   if (a > b) return -1;
// //   if (a < b) return 1;
// // });

// // OR

// movements.sort((a, b) => b - a);

// console.log(movements);

// Array Grouping

// console.log(movements);

// const groupedMovements = Object.groupBy(movements, movement =>
//   movement > 0 ? 'deposits' : 'withdrawals',
// );

// console.log(groupedMovements);

// const groupedAccountsByMovements = Object.groupBy(accounts, account => {
//   const movementCount = account.movements.length;

//   if (movementCount >= 8) return 'very active';
//   if (movementCount >= 4) return 'active';
//   if (movementCount >= 1) return 'moderate';
//   return 'inactive';
// });

// console.log(groupedAccountsByMovements);

// // const groupedAccountsByType = Object.groupBy(accounts, account => account.type);

// // Destructured syntax
// const groupedAccountsByType = Object.groupBy(accounts, ({ type }) => type);

// console.log(groupedAccountsByType);

// // More ways of creating and filling arrays

// // Empty + fill method
// const x = new Array(7);
// console.log(x);

// // // x.fill(1); // mutates original array
// // console.log(x);

// x.fill(1, 3, 5); // element to use to fill, begin parameter, end parameter // uses index number to count
// console.log(x);

// const oneToSeven = [1, 2, 3, 4, 5, 6, 7];
// console.log(oneToSeven);
// oneToSeven.fill(0, 3, 5);
// console.log(oneToSeven);

// // Array.from
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

// console.log(Math.trunc(Math.random() * 10));

// const b = Array.from({ length: 100 }, function () {
//   return Math.trunc(Math.random() * 6) + 1;
// });
// console.log(b);

// const movementsUI = Array.from(document.querySelectorAll('.movements_value'));
// console.log(movementsUI);

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', '')),
//   );

//   console.log(movementsUI);
// });

// // Non-Destructive Alternatives to Mutating Methods

// // 1. Reverse -> toReversed
// console.log(movements);
// // const reversedMov = movements.reverse();
// const reversedMov = movements.toReversed();
// console.log(reversedMov);
// console.log(movements);

// // 2. Sort -> toSorted

// // 3. splce -> toSpliced

// // With Method
// const newMovements = movements.with(1, 2000); // index number, new value

// Array Methods Practice

// const totalBankDeposits = accounts.reduce(function (acc, account) {
//   const totalAccountMovement = account.movements.reduce(
//     (acc, mov) => mov + acc,
//     0,
//   );

//   return totalAccountMovement;
// });

// const totalAccountsArr = accounts.map(account => {
//   const totalAccountMovement = account.movements.reduce(
//     (acu, mov) => acu + mov,
//     0,
//   );

//   return totalAccountMovement;
// });

// const totalBankDeposits = totalAccountsArr.reduce(
//   (acc, amount) => acc + amount,
//   0,
// );

// console.log(totalBankDeposits);

// // 1.
// const accountsTotalDepositsArr = accounts.map(account => {
//   const totalAccountDeposit = account.movements.filter(mov => mov > 0);

//   console.log(totalAccountDeposit);
//   return totalAccountDeposit;
// });

// const accountsTotalDeposits = accountsTotalDepositsArr
//   .flat()
//   .reduce((acc, amount) => acc + amount, 0);

// console.log(accountsTotalDeposits);

// // 2.
// const numDeposits1000 = accounts
//   .flatMap(account => account.movements)
//   // .reduce((count, mov) => (mov >= 1000 ? count + 1 : count), 0);
//   .reduce((count, mov) => (mov >= 1000 ? ++count : count), 0);

// console.log(numDeposits1000);

// // Prefixed ++ operator
// let a = 10;
// console.log(++a);
// console.log(a);

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(account => account.movements)
//   .reduce(
//     (acc, cur) => {
//       // cur > 0 ? (acc.deposits += cur) : (acc.withdrawals += cur);
//       // return acc;
//       acc[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return acc;
//     },
//     { deposits: 0, withdrawals: 0 },
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title -> This Is a Nice Title
// const convertTitleCase = function (title) {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exception = [
//     'a',
//     'an',
//     'and',
//     'the',
//     'but',
//     'for',
//     'or',
//     'on',
//     'in',
//     'with',
//   ];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exception.includes(word) ? word : capitalize(word)))
//     .join(' ');

//   return capitalize(titleCase);
// };

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

// console.log('yuh');

// Coding challenge 5
/* 
Julia and Kate are still studying dogs. This time they are want to figure out if the dogs in their are eating too much or too little food.

- Formula for calculating recommended food portion: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
- Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
- Eating an okay amount means the dog's current food portion is within a range 10% above and below the recommended portion (see hint).

YOUR TASKS:
1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion (recFood) and add it to the object as a new property. Do NOT create a new array, simply loop over the array (We never did this before, so think about how you can do this without creating a new array).
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple users, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much (ownersTooMuch) and an array with all owners of dogs who eat too little (ownersTooLittle).
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is ANY dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether ALL of the dogs are eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Group the dogs into the following 3 groups: 'exact', 'too-much' and 'too-little', based on whether they are eating too much, too little or the exact amount of food, based on the recommended food portion.
9. Group the dogs by the number of owners they have
10. Sort the dogs array by recommended food portion in an ascending order. Make sure to NOT mutate the original array!

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John', 'Leo'] },
  { weight: 18, curFood: 244, owners: ['Joe'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

GOOD LUCK 😀 
*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John', 'Leo'] },
  { weight: 18, curFood: 244, owners: ['Joe'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.

const calcRecommendedFood =
  // Add recommended food to each dog object
  dogs.forEach(dog => {
    const recFood = dog.weight ** 0.75 * 28;

    dog.recFood = recFood;

    console.log('1.', dog);
  });

// calcRecommendedFood(dogs);
// console.log(dogs);

// 2.

const findSarah = dogs.find(obj => obj.owners.includes('Sarah'));
console.log('2.', 'Sarahs dog', findSarah);

if (findSarah.curFood > findSarah.recFood) console.log('2.', 'fat');
else console.log('2.', 'okay');

// 3.

const ownersTooMuch = dogs.filter(dog => dog.curFood > dog.recFood);
const ownersTooLittle = dogs.filter(dog => dog.curFood < dog.recFood);

console.log(
  '3.',
  'ownersTooMuch',
  ownersTooMuch,
  'ownersTooLittle',
  ownersTooLittle,
);

// 4.

const ownersTM = ownersTooMuch.flatMap(dog => dog.owners);
console.log(ownersTM);

const ownersTMJoin = ownersTM.join(' and '); /*+ "dog's eat too much"*/
const ownersTMStr = ownersTMJoin + "'s" + " dog's eat too much";
console.log('4.', ownersTMStr);

const ownersTL = ownersTooLittle.flatMap(dog => dog.owners);
console.log(ownersTL);

const ownersTLJoin = ownersTL.join(' and '); /*+ "dog's eat too much"*/
const ownersTLStr = ownersTLJoin + "'s" + " dog's eat too much";
console.log('4.', ownersTLStr);

// 5.

const eatingRecFood = dogs.some(dog => dog.curFood === dog.recFood);
console.log('5.', eatingRecFood);

// 6.

const eatingOkayFood = dogs.every(
  dog => dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1,
);

console.log('6.', eatingOkayFood);

// 7.

const eatingOkayArr = dogs.map(dog => {
  if (dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1)
    return dog;
  else return '';
});

console.log('7.', eatingOkayArr);

// 8.

const ownersExactFood = dogs.filter(dog => dog.curFood === dog.recFood);
console.log(ownersExactFood);

const allOwners = [ownersTooMuch, ownersTooLittle, ownersExactFood];

// const groupedDogs = allOwners.forEach(arr =>
//   Object.groupBy(arr, dog => {
//     if (dog.curFood > dog.recFood) 'too much';
//     else if (dog.curFood < dog.recFood) 'too little';
//     else if (dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1)
//       'okay';
//   }),
// );

// console.log(groupedDogs);

const groupedDogs = Object.groupBy(ownersTooMuch, dog => {
  if (dog.curFood > dog.recFood) 'too much';
  else if (dog.curFood < dog.recFood) 'too little';
  else if (dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1)
    'okay';
});

console.log(groupedDogs);
console.log('yuh');
