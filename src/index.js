
/**
 * with-observe uses RXJS to implement its observer/observable
 * patterns.
 * https://github.com/Reactive-Extensions/RxJS
 */
import Rx from 'rx';

export default function withObserve() {
    this.before('initialize', function () {
        this.localSubscriptions = [];
    });

    /**
     * Observe a sequence which can be disposed of on teardown.
     *
     * Takes the sequence to observe.
     * Returns the observable sequence.
     */
    this.observe = function (upstream) {
        return Rx.Observable.create((o) => {
            var subscription = upstream.subscribe(o);
            // Store the subscription so that the mixin can dispose on teardown.
            this.localSubscriptions.push(subscription);
            return subscription;
        }, upstream);
    };

    this.before('teardown', function () {
        this.localSubscriptions.forEach(function (subscription) {
            subscription.dispose();
        });
    });
}
