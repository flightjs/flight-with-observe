import Rx from 'rx';
import { component } from 'flight';
import withObserve from '.';

describe('withObserve', function () {
    var subject;
    var observable;

    beforeEach(function () {
        subject = new Rx.BehaviorSubject(1);
        observable = subject.asObservable();
        const Component = component(function Base() {}, withObserve);
        this.component = (new Component()).initialize(document.body);
    });

    afterEach(function () {
        try {
            this.component.teardown();
        } catch (e) {}
    });

    it('should observe changed values', function (done) {
        this.component.observe(observable).subscribeOnNext(function (value) {
            if (value === 2) {
                done();
            }
        });
        subject.onNext(2);
    });

    it('should dispose of observables on teardown', function () {
        this.component.observe(observable);

        var called = 0;
        this.component.observe(observable).subscribeOnNext(function (value) {
            called = called + 1;
        });
        expect(called).toBe(1);

        subject.onNext('still subscribed');
        expect(called).toBe(2);

        // Teardown the component and check handler is not called again.
        this.component.teardown();
        subject.onNext('not subscribed');
        expect(called).toBe(2);
    });

    it('should end the stream on teardown', function () {
        var onNextSpy = jasmine.createSpy('onNextSpy');
        var onErrorSpy = jasmine.createSpy('onErrorSpy');
        var onCompletedSpy = jasmine.createSpy('onCompletedSpy');
        this.component.observe(observable).subscribe(onNextSpy, onErrorSpy, onCompletedSpy);
        this.component.teardown();
        subject.onNext(10);
        expect(onNextSpy).not.toHaveBeenCalledWith(10);
        expect(onErrorSpy).not.toHaveBeenCalled();
        expect(onCompletedSpy).toHaveBeenCalled();
    });
});
