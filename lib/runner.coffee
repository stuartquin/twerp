class exports.Runner
  constructor: ( @options, filenames ) ->
    # colour output if we're allowed
    if @options.noColor or @options.noColour
      @cNorm = @cRed = @cGreen = ""
    else
      @cNorm  = "\u001B[39m"
      @cRed   = "\u001B[31m"
      @cGreen = "\u001B[32m"

    # will contain a list of classes to run
    @queue  = [ ]

    # not loaded yet
    @coffee_loaded = false

    # load the files we're given
    @loadFile f for f in filenames

  green: ( text ) => "#{@cGreen}#{text}#{@cNorm}"
  red:   ( text ) => "#{@cRed}#{text}#{@cNorm}"

  getNext: ( ) -> @queue.shift( )

  run: ( @finished ) ->
    if current = @getNext( )
      @runClass current

  onAssertionPass: ( ) ->
  onAssertionFail: ( error ) ->

  onStartTest: ( ) ->
  onEndTest: ( ) ->

  onStartClass: ( ) ->
  onEndClass: ( ) ->

  onStartFile: ( ) ->
  onEndFile: ( ) ->

  onEndRun: ( ) ->

  runClass: ( [ filename, cls, func ] ) ->
    next = @getNext( )
    obj  = new func( @options )

    if @current_filename isnt filename
      if @current_filename?
        @onEndFile @current_filename

      @onStartFile filename
      @current_filename = filename

    # stuff a runner implementor might override.
    obj.on "pass", @onAssertionPass
    obj.on "fail", @onAssertionFail

    obj.on "startTest", @onStartTest
    obj.on "endTest", @onEndTest

    @onStartClass cls

    do ( next, cls ) =>
      obj.run ( results ) =>
        @onEndClass cls, results

        # unless we're the last, daisy chain to the next function
        if next
          @runClass next
        else
          @onEndFile @current_filename
          @current_filename = null
          @onEndRun( results )
          @finished?( results )

  loadFile: ( filename ) ->
    cwd = process.cwd()

    # find a coffee script, load coffee. If the require throws an
    # exception then so be it.
    if /\.coffee$/.exec( filename ) and not @coffee_loaded
      require "coffee-script"
      @coffee_loaded = true

    actual = if /^\//.exec filename
      filename
    else
      "#{cwd}/#{filename}"

    for cls, func of require actual
      # only run the class we were asked to
      if @options.matchClass
        re = new RegExp @options.matchClass
        continue unless re.exec cls

      # if it's a test, queue it
      if func.isTwerpTest
        @queue.push [ filename, cls, func ]

    return true
