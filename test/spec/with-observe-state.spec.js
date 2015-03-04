define(function (require) {
    'use strict';

    var Rx = require('rxjs');

    describeMixin('lib/with-observe-state', function () {

        var observable;
        var observableState;

        beforeEach(function () {
            observable = new Rx.BehaviorSubject(1);
            observableState = new Rx.BehaviorSubject({
                count: 1,
                active: false
            });
            this.setupComponent();
        });

        it('should observe changed values', function (done) {
            this.component.observe(observable).subscribeOnNext(function (value) {
                if (value === 2) {
                    done();
                }
            });
            observable.onNext(2);
        });

        it('should dispose of observables on teardown', function () {
            this.component.observe(observable);

            var called = 0;
            this.component.observe(observable).subscribeOnNext(function (value) {
                called = called + 1;
            });
            expect(called).toBe(1);

            observable.onNext('still subscribed');
            expect(called).toBe(2);

            // Teardown the component and check handler is not called again.
            this.component.teardown();
            observable.onNext('not subscribed');
            expect(called).toBe(2);

        });

        describe('observable state', function () {
            it('should observe changed state values', function (done) {
                this.component.observeState(observableState).subscribeOnNext(function (state) {
                    if (state.count === 2) {
                        done();
                    }
                });
                observableState.onNext({
                    count: 2
                });
            });

            it('should not observe unchanged state values', function () {
                var called = 0;
                this.component.observeState(observableState, ['count']).subscribe(function (state) {
                    called = called + 1;
                });
                expect(called).toBe(1);

                // Push an unchanged/duplicate value into the stream.
                observableState.onNext({
                    count: 1
                });
                expect(called).toBe(1);
            });

            it('should only return state for requested keys', function (done) {
                this.component.observeState(observableState, ['count']).subscribe(function (state) {
                    expect(state.active).toBe(undefined);
                    expect(state.count).toBe(1);
                    done();
                });
            });

            it('should return all state keys if none are passed in', function (done) {
                this.component.observeState(observableState).subscribe(function (state) {
                    expect(state.active).toBe(false);
                    expect(state.count).toBe(1);
                    done();
                });
            });
        });
    });
});
