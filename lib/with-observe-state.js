define(function (require) {
    'use strict';

    return withObserveState;
    function withObserveState() {
        /* jshint validthis: true */

        this.before('initialize', function () {
            this.withObserveState = {
                localConnections: []
            };
        });

        /**
         * Observe a stream which can be disposed of on teardown.
         *
         * Takes the stream to observe.
         * Returns the observable stream.
         */
        this.observe = function (stream) {
            var observable = stream.publishValue();

            // Store the connection so that the mixin can dispose on teardown.
            this.withObserveState.localConnections.push(observable.connect());

            return observable;
        };

        /**
         * Observe an observableState stream which can be disposed of on teardown.
         *
         * observableState by convention is just a key/value object. If not, this
         * doesn't do anything useful, so just use observe().
         *
         * Takes the stream to observe and an optional array of keys to filter by.
         * Returns the observable stream.
         */
        this.observeState = function (stream, keys) {
            var observable = this.observe(stream);

            var filteredKeys = keys ? filterKeys(keys) : function (s) { return s; };
            return observable.map(filteredKeys)
                .distinctUntilChanged(undefined, anyKeysHaveChanged);
        };

        this.before('teardown', function () {
            this.withObserveState.localConnections.forEach(function (connection) {
                connection.dispose();
            });
        });

        function anyKeysHaveChanged (next, previous) {
            return !Object.keys(next).some(function (key) {
                return previous[key] !== next[key];
            });
        }

        function filterKeys (keys) {
            return function (newState) {
                if (!keys) {
                    return newState;
                }

                // Filter for wanted keys
                return keys.reduce(function (o, key) {
                    o[key] = newState[key];
                    return o;
                }, {});
            };
        }
    }
});
