# Collection

This is a small pseudo-library/class for managing collections. I currently don't plan on publishing this to npm as it is primarily intended for personal use. The package is written in TypeScript (available in [src](src)) but is exported as an es2015+ module, es5 umd library, and es5 minified (available in [dist](dist)). It should be noted; however, that Symbols are used lightly to provide some of the functionality in the package and will need to be polyfilled should support for older browsers be necessary.

### What is this?

This collection management library is inspired by Daniel Shiffman and [The Coding Train](https://www.youtube.com/user/shiffman) YouTube channel. In his coding challenges, Daniel often stores collections of objects as arrays and perform actions using many, _many_ for loops. That inspired me to write somewhat of an abstraction layer for managing a collection of objects of the same class.

### Usage

I recommend that you manually download one of the files in the [dist](dist) folder and add it to your project. To start, you need to instantialize a collection object, passing in the class each item is meant to be. If you're using TS, you also have to pass in the type as a generic parameter.

**JavaScript**

```javascript
import Collection from './path/to/collection.js';
const animals = new Collection(Animal);
```

**TypeScript**

	import Collection from './path/to/collection.js';
	const animals: Collection<Animal> = new Collection(Animal);

#### Generating objects

The first major feature of this library is automatically filling the collection with a specified amount of objects using the `.generate` function. This functions takes two parameters: the number of items to generate and an array of parameters to pass into the constructor. For example, say the Animal class from above has a signature of `(id: number, name: string, legs: number)`.The Coding Train You can create thirty animals with 2 legs named Paul like so:

```javascript
animals.generate(30, [1, 'Paul', 2])
```

Of course, this would end up creating a series of identical objects, and due to the limitations of JavaScript, you can't exactly pass in a generator function to generate a different value for each member. While I could simply evaluate each parameter that is a function, that removes the ability to pass in a callback function to the class. Therefore, the Collection library comes with a set of static methods to help with this.

**Collection.eval(func)**

A function passed into `Collection.eval` will be evaluated for each new item. For example, passing in `Collection.eval(Math.random)` will result in a different random number. The function can accept an index parameter so you can return a value based on the order of the item.

**Collection.cycle(array)**

The generator function will cycle through each item in the array you pass into this method and return that value. For example, if you passed in `[1, 2, 3]`, this value for the first item will compile into `1`, the second `2`, the third `3`, and the fourth will restart at `1`.

**Collection.index**

This is just a shorthand for `Collection.eval(i => i)` and compiles into the current index.

**Example**

```javascript
animals.generate(5, [
	Collection.index,
	Collection.eval(() => randomFromArray(animalNames)),
	Collection.cycle([2, 4, 8])
]);

//= [{id: 0, name: 'Random Name 1', legs: 2}, {id: 1, name: 'Random Name 2', legs: 4}, {id: 2, name: 'Random Name 3', legs: 8} ...]
```

#### Dynamically add objects

You can use `.add()` to manually add an object of the correct type. Note that this is essentially double-checked in TypeScript as there is a manual check for the type in vanilla JavaScript.

**Example**

```javascript
const myAnimal = new Animal(13, 'Bizarro', 4);
animals.add(myAnimal);
```

#### Iterate through items

I consider this to be the most important feature of this library. Using `.each()`, you can iterate through all the items in the collection, then either perform a callback on each item or call an instance method of the class that gets applied to every item in the collection.

**Example**

```javascript
animals.each(function(animal) {
	animal.legs++; // Mutate the animal
});

// OR

animals.each().speak(); // Assuming the `.speak()` method exists on the Animal class
```
