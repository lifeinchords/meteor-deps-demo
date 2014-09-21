// Note that Meteor recently changed the name of Deps to Tracker
// Both should work and are identical.
// Most tutorials online still refer to it as Deps

// based on:
// http://robertdickert.com/blog/2013/11/14/why-is-my-meteor-app-not-updating-reactively
// https://meteor.hackpad.com/DRAFT-Understanding-Deps-aAXG6T9lkf6
// http://manual.meteor.com/#tracker

// **********************************
// Meteor reactivity (binding) works with 2 key parts
// A) a function, placed inside a computation, also known as reactive *context
// B) a data source set up to "be" reactive. 
//    The data source keeps track of which computations are called on it, 
//    also know as it's dependencies. 
// **********************************

// Reactivity only works on the client
// you cannot expect a Meteor.publish block to rerun when the result of 
// Collection.find() changes. 
// If you need server reactivity, use cursor.observe() or cursor.observeChanges()
if (Meteor.isClient) {

  // Meteor automatically makes some of its data sources reactive:
  //    - Session.get()
  //    - Meteor.Collection.find()
  //    - Certain Meteor app status objects, such as Meteor.userId
  //    - Reactive data sources from outside packages, such as Iron Router’s Router.current()

  // However, here we want a custom peice of our code
  // to act as a reactive data source
  // we need only 3 lines to do so
  bonusMode = {
    mode: 'normal',
    dep: new Tracker.Dependency,  // 1: dependent computations are stored here
    get: function () {
      this.dep.depend();          // 2: saves the Tracker.currentComputation
      return this.mode;
    },
    set: function (newValue){
      this.mode = newValue;
      this.dep.changed();         // 3: invalidates all dependent computations
      return this.mode;
    }
  };


// Now that we have our reactive data source, 
// we need to set up the 2nd half, what consumes or is connected to it. 

// we'll set up two dependencies, one called A, and one called B
// just using A + B as a way to easily name and reference them

// Meteor does not require 2: 
// You could have 1, 2, 50 or any number of dependencies
// we're just using 2 to demonstrate 2 slightly differences types of creating them,
// and to demonstrate how they behave in relation to the same data source

// think of these as observers that keep their ears open
// for changes that the data source shouts out whenever something has happened:
// (data has changed)

// We create a reactive context, also known as a dependancy by wrapping some 
// code inside a Tracker.autorun function.
// we'll arbitratily refer to this as dependancy A
// we save a reference to this dependancy, as we'll need it later. 
// We do this by assigning the call to a variable
// we arbitrarily name it 'handle' here, it could be named anything you want
  handle = Tracker.autorun(function (){

    // useful way to check if you are in a reactive context
    console.log('active?', Tracker.active); // true

    console.log('dependancy A, via Tracker.autorun(). mode:', bonusMode.get() );
  });


  // Meteor wraps templates + helpers automatically into computations by default as a convenience.
  // thus, bonusMode.get() here accompishes the same result (being wired for reactivity)
  // as the bonusMode.get() inside the Tracker.autorun call above

  // We're going to make a second dependancy anyway
  // simply by calling bonusMode.get() inside this template method
  Template.hello.greeting = function () {

    console.log('dependancy B, via template. mode:', bonusMode.get() );

    // useful way to check if you are in a reactive context
    console.log('active?', Tracker.active); // true

    return bonusMode.get();
  };


  // this code is just for us to see when the page is done loading
  Template.hello.rendered = function () {
    console.log('******* done init ********');
  };
}


/*

// now on the console, try these one by one:

// first, you can see we are not in a reactive context anymore
Tracker.active; // should yield false

// we declared 2 dependencies above. 
// both should be rerun when,
// from the console, we do:
bonusMode.set('hyperspeed');  

// to see the object holding references to our dependencies A and B.
// this lives on the data soure side.
// think of it as an index of all the things (computations)
// that are listening for changes to our data
bonusMode.dep;

// we tell our dependenacy side to rerun
// only dependency A is affected, because we saved a reference to it
// to the variable handle 
// think of this as invalidating a cached item and triggering 
// a fresh pull from the original source
handle.invalidate();

// to cut the cord for dependency A, try this from the console.
// also, very good to do this when your app can, to prevent leaks
// dependancy B is unaffected, as it's connection to the data source
// is untouched when we manipulate the handle
handle.stop();

// reruns all reactive computations that are registered to this 
// reactive data source, from the source/observable/subject side
// we would have two here, but since we cut the cord on dependancy A 
// in the previous statement with handle.stop
// only dependancy B reruns now
bonusMode.dep.changed();


*/
  