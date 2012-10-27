class Buffer
  constructor:  ->
    @_digits = []
    @_dotPos = null
    @_minus = null
    
  putDot: ->
    @_dotPos = @_digits.length
  
  putDigit: (n) ->
    @_digits.push n
  
  toggleSign: ->
    if @_minus == true
      @_minus = false
    else
      @_minus = true
    
  isEmpty: ->
    not @_dotPos? and not @_minus? and @_digits.length == 0
  
  _absValue: ->
  
  text: ->
    chars = @_digits.concat()
    
    if @_dotPos?
      chars.splice @_dotPos, 0, '.'
      if @_dotPos == 0
        chars.unshift 0
    if @_minus == true
      chars.unshift '-'
    chars.join ''
  
  value: ->
    if @_digits.length == 0
      0
    else
      parseInt @text()


class Model
  constructor: ->
    @_operator = null
    @_leftValue = null
    @_rightValue = null
    @_listeners = []
    @_buffer = new Buffer
  
  putDigit: (n) ->
    @_putToBuffer => @_buffer.putDigit(n)
  
  putDot: ->
    @_putToBuffer => @_buffer.putDot()
  
  toggleSign: ->
    @_putToBuffer => @_buffer.toggleSign()
  
  _putToBuffer: (callable)->
    try
      if @_rightValue?
        @_buffer = new Buffer
        @_leftValue = @_operator = @_rightValue = null
        
    finally
      callable()
      @emitChange()
  
  putOperator: (operator) ->
    try
      if @_leftValue? and not @_buffer.isEmpty()?
        @_leftValue = @_operator.call @_leftValue, @_buffer.value()
      else
        @_leftValue = @_buffer.value()
    finally
      @_rightValue = null
      @_operator = operator
      @_buffer = new Buffer
      @emitChange()
  
  putEnter: ->
    try
      if not @_operator?
        if not @_leftValue?
          @_leftValue = @_buffer.value()
        return
      
      if not @_rightValue?
        if @_buffer.isEmpty()
          return
        @_rightValue = @_buffer.value()
      
      @_leftValue = @_operator.call @_leftValue, @_rightValue
    finally
      @_buffer = new Buffer
      @emitChange()
  
  clear: ->
    try
      if not @_operator?
        @_leftValue = null
    finally
      @_buffer = new Buffer
      @_operator = null
      @_rightValue = null
      @emitChange()
  
  bufferText: ->
    if @_buffer.isEmpty()
      @_leftValue
    else
      @_buffer.text()

  operatorName: ->
    if @_operator?
      @_operator.name()
    else
      null
  
  addListener: (listener) ->
    @_listeners.push listener
  
  emitChange: ->
    model = this
    $.each @_listeners, (i, f) =>
      f(model)



$(document).live 'pageinit', (event) =>
  model = new Model
  $('.digit').bind 'tap', (event) ->
    model.putDigit parseInt($(this).data('digit'))

  $('#dot').bind 'tap', (event) ->
    model.putDot()

  $('#enter').bind 'tap', (event) ->
    model.putEnter()

  $('.operator').bind 'tap', (event) ->
    operatorName = $(this).attr('id')
    operators = 
      add: (left, right) => left + right
      sub: (left, right) => left - right
      mul: (left, right) => left * right
      div: (left, right) => left / right
      mod: (left, right) => left % right
    
    model.putOperator
      name: => operatorName
      call: operators[operatorName]
  
  $('#clear').bind 'tap', (event) ->
    model.clear()
  
  $('#sign').bind 'tap', (event) ->
    model.toggleSign()
  
  model.addListener (model) =>
    $('.operator').removeClass 'ui-btn-active'
    if model.operatorName()?
      $('#' + model.operatorName()).addClass('ui-btn-active')
    $('#buffer').val model.bufferText()

  $('#buffer').val model.bufferText()

