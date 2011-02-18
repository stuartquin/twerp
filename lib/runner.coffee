class exports.Runner
  constructor: ( @options, filenames ) ->
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

  run: ( ) ->
    if current = @getNext( )
      @runClass current

  display: ( filename, cls, results ) ->

  runClass: ( [ filename, cls, func ] ) ->
    next = @getNext( )
    obj  = new func( )

    do ( next ) =>
      obj.run ( results ) =>
        @display filename, cls, results

        # unless we're the last, daisy chain to the next function
        @runClass next if next

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
      # if it's a test, queue it
      if func.isTwerpTest
        @queue.push [ filename, cls, func ]

    return true
