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

animals.generate(names.length, [
	Collection.index,
	Collection.cycle(names)
]);

for(const a of animals) {
	console.log(a);
}

animals.each().speak();