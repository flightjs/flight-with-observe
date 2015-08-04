define(function (require) {
    'use strict';

    /**
     * with-observe uses RXJS to implement its observer/observable
     * patterns.
     * https://github.com/Reactive-Extensions/RxJS
     */
    var Rx = require('rxjs');

    return withObserve;
    function withObserve() {
        /* jshint validthis: true */

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
            return Rx.Observable.create(function (o) {
                var subscription = upstream.subscribe(o);
                // Store the subscription so that the mixin can dispose on teardown.
                this.localSubscriptions.push(subscription);
                return subscription;
            }.bind(this), upstream);
        };

        this.before('teardown', function () {
            this.localSubscriptions.forEach(function (subscription) {
                subscription.dispose();
            });
        });
    }
});
