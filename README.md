Note that Meteor recently changed the name of Deps to Tracker
Both should work and are identical.
Most tutorials online still refer to it as Deps

based on:
http://robertdickert.com/blog/2013/11/14/why-is-my-meteor-app-not-updating-reactively
https://meteor.hackpad.com/DRAFT-Understanding-Deps-aAXG6T9lkf6
http://manual.meteor.com/#tracker

**********************************
Meteor reactivity (binding) works with 2 key parts
A) a function, placed inside a computation, also known as reactive *context
B) a data source set up to "be" reactive. 
   The data source keeps track of which computations are called on it, 
   also know as it's dependencies. 
**********************************