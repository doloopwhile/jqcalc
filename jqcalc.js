(function() {
  var Buffer, Model,
    _this = this;

  Buffer = (function() {

    function Buffer() {
      this._digits = [];
      this._dotPos = null;
      this._minus = null;
    }

    Buffer.prototype.putDot = function() {
      return this._dotPos = this._digits.length;
    };

    Buffer.prototype.putDigit = function(n) {
      return this._digits.push(n);
    };

    Buffer.prototype.toggleSign = function() {
      if (this._minus === true) {
        return this._minus = false;
      } else {
        return this._minus = true;
      }
    };

    Buffer.prototype.isEmpty = function() {
      return !(this._dotPos != null) && !(this._minus != null) && this._digits.length === 0;
    };

    Buffer.prototype._absValue = function() {};

    Buffer.prototype.text = function() {
      var chars;
      chars = this._digits.concat();
      if (this._dotPos != null) {
        chars.splice(this._dotPos, 0, '.');
        if (this._dotPos === 0) chars.unshift(0);
      }
      if (this._minus === true) chars.unshift('-');
      return chars.join('');
    };

    Buffer.prototype.value = function() {
      if (this._digits.length === 0) {
        return 0;
      } else {
        return parseInt(this.text());
      }
    };

    return Buffer;

  })();

  Model = (function() {

    function Model() {
      this._operator = null;
      this._leftValue = null;
      this._rightValue = null;
      this._listeners = [];
      this._buffer = new Buffer;
    }

    Model.prototype.putDigit = function(n) {
      var _this = this;
      return this._putToBuffer(function() {
        return _this._buffer.putDigit(n);
      });
    };

    Model.prototype.putDot = function() {
      var _this = this;
      return this._putToBuffer(function() {
        return _this._buffer.putDot();
      });
    };

    Model.prototype.toggleSign = function() {
      var _this = this;
      return this._putToBuffer(function() {
        return _this._buffer.toggleSign();
      });
    };

    Model.prototype._putToBuffer = function(callable) {
      try {
        if (this._rightValue != null) {
          this._buffer = new Buffer;
          return this._leftValue = this._operator = this._rightValue = null;
        }
      } finally {
        callable();
        this.emitChange();
      }
    };

    Model.prototype.putOperator = function(operator) {
      try {
        if ((this._leftValue != null) && !(this._buffer.isEmpty() != null)) {
          return this._leftValue = this._operator.call(this._leftValue, this._buffer.value());
        } else {
          return this._leftValue = this._buffer.value();
        }
      } finally {
        this._rightValue = null;
        this._operator = operator;
        this._buffer = new Buffer;
        this.emitChange();
      }
    };

    Model.prototype.putEnter = function() {
      try {
        if (!(this._operator != null)) {
          if (!(this._leftValue != null)) this._leftValue = this._buffer.value();
          return;
        }
        if (!(this._rightValue != null)) {
          if (this._buffer.isEmpty()) return;
          this._rightValue = this._buffer.value();
        }
        return this._leftValue = this._operator.call(this._leftValue, this._rightValue);
      } finally {
        this._buffer = new Buffer;
        this.emitChange();
      }
    };

    Model.prototype.clear = function() {
      try {
        if (!(this._operator != null)) return this._leftValue = null;
      } finally {
        this._buffer = new Buffer;
        this._operator = null;
        this._rightValue = null;
        this.emitChange();
      }
    };

    Model.prototype.bufferText = function() {
      if (this._buffer.isEmpty()) {
        return this._leftValue;
      } else {
        return this._buffer.text();
      }
    };

    Model.prototype.operatorName = function() {
      if (this._operator != null) {
        return this._operator.name();
      } else {
        return null;
      }
    };

    Model.prototype.addListener = function(listener) {
      return this._listeners.push(listener);
    };

    Model.prototype.emitChange = function() {
      var model,
        _this = this;
      model = this;
      return $.each(this._listeners, function(i, f) {
        return f(model);
      });
    };

    return Model;

  })();

  $(document).live('pageinit', function(event) {
    var model;
    model = new Model;
    $('.digit').bind('tap', function(event) {
      return model.putDigit(parseInt($(this).data('digit')));
    });
    $('#dot').bind('tap', function(event) {
      return model.putDot();
    });
    $('#enter').bind('tap', function(event) {
      return model.putEnter();
    });
    $('.operator').bind('tap', function(event) {
      var operatorName, operators,
        _this = this;
      operatorName = $(this).attr('id');
      operators = {
        add: function(left, right) {
          return left + right;
        },
        sub: function(left, right) {
          return left - right;
        },
        mul: function(left, right) {
          return left * right;
        },
        div: function(left, right) {
          return left / right;
        },
        mod: function(left, right) {
          return left % right;
        }
      };
      return model.putOperator({
        name: function() {
          return operatorName;
        },
        call: operators[operatorName]
      });
    });
    $('#clear').bind('tap', function(event) {
      return model.clear();
    });
    $('#sign').bind('tap', function(event) {
      return model.toggleSign();
    });
    model.addListener(function(model) {
      $('.operator').removeClass('ui-btn-active');
      if (model.operatorName() != null) {
        $('#' + model.operatorName()).addClass('ui-btn-active');
      }
      return $('#buffer').val(model.bufferText());
    });
    return $('#buffer').val(model.bufferText());
  });

}).call(this);
