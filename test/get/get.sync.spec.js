var jsong = require("../../index");
var Model = jsong.Model;
var Cache = require("../data/Cache");
var Expected = require("../data/expected");
var Rx = require("rx");
var runGetTests = require("./../getTestRunner").run;
var testRunner = require("./../testRunner");
var model = testRunner.getModel(null, Cache());
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var Materialized = Expected.Materialized;
var Boxed = Expected.Boxed;
var Errors = Expected.Errors;
var expect = require('chai').expect;

describe('GetValueSync', function() {
    it('should get a value.', function() {
        var model = new Model({cache: Cache()});
        model._root.unsafeMode = true;
        var value = model.getValueSync(['videos', 1234, 'summary']);
        testRunner.compare(Values().direct.AsJSON.values[0].json, value);
    });
    it('should get a value through some references.', function() {
        var model = new Model({cache: Cache()});
        model._root.unsafeMode = true;
        var value = model.getValueSync(['genreList', 0, 0, 'summary']);
        testRunner.compare(Values().direct.AsJSON.values[0].json, value);
    });
    it('should throw an error when it encounters one.', function() {
        var model = new Model({cache: Cache()});
        model._root.unsafeMode = true;
        
        var error = false;
        try {
            model.getValueSync(['videos', 'errorBranch']);
        } catch (e) {
            testRunner.compare(Values().errorBranchSummary.AsJSON.errors[0], e);
            error = true;
        }
        expect(error, 'getValueSync did not throw an error.').to.be.ok;
    });

    describe('Missing & Expired', function() {
        it('should get undefined when encountering missing keys.', function() {
            var model = new Model({cache: Cache()});
            model._root.unsafeMode = true;
            var value = model.getValueSync(['genreList', 'missing-branch']);
            testRunner.compare(undefined, value);
        });
        it('should get undefined when encountering an expired branch.', function() {
            var model = new Model({cache: Cache()});
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 'expiredLeafByTimestamp', 'summary']);
            testRunner.compare(undefined, value);
        });
        it('should get undefined when selecting past a leaf value.', function() {
            var model = new Model({cache: Cache()});
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 1234, 'summary', 'missing']);
            testRunner.compare(undefined, value);
        });
        it('should report undefined when selecting past an error.', function() {
            var model = new Model({cache: Cache()});
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 'errorBranch', 'summary']);
            testRunner.compare(undefined, value);
        });
    });

    describe('BoxValues', function() {
        it("should get a value directly as a sentinel in boxed mode", function() {
            var model = new Model({cache: Cache()}).boxValues();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 0, 'summary']);
            testRunner.compare(Boxed().sentinelValue.AsJSON.values[0].json, value);
        });
        it("should get a reference value directly as a reference in boxed mode", function() {
            var model = new Model({cache: Cache()}).boxValues();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['genreList', 0]);
            testRunner.compare(Boxed().referenceValue.AsJSON.values[0].json, value);
        });
    });

    describe('Materialize', function() {
        it('should get undefined when encountering missing keys.', function() {
            var model = new Model({cache: Cache()}).materialize();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['genreList', 'missing-branch']);
            testRunner.compare({$type: 'sentinel'}, value);
        });
        it('should get undefined when encountering an expired branch.', function() {
            var model = new Model({cache: Cache()}).materialize();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 'expiredLeafByTimestamp', 'summary']);
            testRunner.compare({$type: 'sentinel'}, value);
        });
        it('should get undefined when selecting past a leaf value.', function() {
            var model = new Model({cache: Cache()}).materialize();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 1234, 'summary', 'missing']);
            testRunner.compare({$type: 'sentinel'}, value);
        });
    });
    
    describe('TreatErrorsAsValues', function() {
        it('should throw an error when it encounters one.', function() {
            var model = new Model({cache: Cache()}).treatErrorsAsValues();
            model._root.unsafeMode = true;
            var value = model.getValueSync(['videos', 'errorBranch']);
            testRunner.compare('I am yelling timber.', value);
        });
    });
});
