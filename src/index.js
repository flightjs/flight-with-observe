
/**
 * with-observe uses RXJS to implement its observer/observable
 * patterns.
 * https://github.com/Reactive-Extensions/RxJS
 */
import Rx from 'rxjs';

export default function withObserve() {
    this.before('initialize', function () {
        this.localSubscriptions = [];
    });

    /**
     * Observe a sequence is unsubscribed from on teardown.
     *
     * Takes the sequence to observe.
     * Returns the observable sequence.
     */
    this.observe = function (upstream) {
        return Rx.Observable.create(observer => {
            var upstreamSubscription = upstream.subscribe(observer);
            // Create our own subscription so we can track teardown. When that happens,
            // notify the observer that the observable is completed (no more values),
            // and unsubscribe.
            var subscription = new Rx.Subscription(() => {
                observer.complete();
                upstreamSubscription.unsubscribe();
            });
            // Store the subscription so that the mixin can unsubscribe on teardown.
            this.localSubscriptions.push(subscription);
            // Returning the subscription means that manually unsubscribing from
            // the observable returned from this.observe will cause the upstreamSubscription
            // to complete and then unsubscribe.
            return subscription;
        });
    };

    this.before('teardown', function () {
        this.localSubscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    });
}
