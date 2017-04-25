import Rx from 'rxjs';
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
        this.component.observe(observable).subscribe(function (value) {
            if (value === 2) {
                done();
            }
        });
        subject.next(2);
    });

    it('should unsubscribe from subscriptions on teardown', function () {
        this.component.observe(observable);

        var called = 0;
        this.component.observe(observable).subscribe(function (value) {
            called = called + 1;
        });
        expect(called).toBe(1);

        subject.next('still subscribed');
        expect(called).toBe(2);

        // Teardown the component and check handler is not called again.
        this.component.teardown();
        subject.next('not subscribed');
        expect(called).toBe(2);
    });

    it('should end the stream on teardown', function () {
        var nextSpy = jasmine.createSpy('nextSpy');
        var errorSpy = jasmine.createSpy('errorSpy');
        var completedSpy = jasmine.createSpy('completedSpy');
        this.component.observe(observable).subscribe(nextSpy, errorSpy, completedSpy);
        this.component.teardown();
        subject.next(10);
        expect(nextSpy).not.toHaveBeenCalledWith(10);
        expect(errorSpy).not.toHaveBeenCalled();
        expect(completedSpy).toHaveBeenCalled();
    });
});
