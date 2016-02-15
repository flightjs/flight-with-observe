
/**
 * with-observe uses RXJS to implement its observer/observable
 * patterns.
 * https://github.com/Reactive-Extensions/RxJS
 */
import Rx from 'rx';

export default function withObserve() {
    this.before('initialize', function () {
        this.localDisposables = [];
    });

    /**
     * Observe a sequence is disposed of on teardown.
     *
     * Takes the sequence to observe.
     * Returns the observable sequence.
     */
    this.observe = function (upstream) {
        return Rx.Observable.create(observer => {
            var upstreamDisposable = upstream.subscribe(observer);
            // Create our own disposable so we can track teardown. When that happens,
            // notify the observer.
            var disposable = Rx.Disposable.create(function () {
                upstreamDisposable.dispose();
                observer.onCompleted();
            });
            // Store the disposable so that the mixin can dispose on teardown.
            this.localDisposables.push(disposable);
            return disposable;
        }, upstream);
    };

    this.before('teardown', function () {
        this.localDisposables.forEach(function (disposable) {
            disposable.dispose();
        });
    });
}
