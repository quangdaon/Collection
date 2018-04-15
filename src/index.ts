import Collection from './collection';

class Animal {
	constructor(public id: number, public name: string) {
	}

	speak() {
		console.log('My name is ' + this.name);
	}
}

const animals: Collection<Animal> = new Collection(Animal);

const names: Array<string> = ['a', 'b', 'c'];

animals.generate(names.length * 4, [
	Collection.index,
	Collection.cycle(names)
]);

animals.each().speak();

const c: Animal = animals.get(2);

console.log(animals.length);
animals.remove(i => i.name === 'c');

console.log(animals.length);