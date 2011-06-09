sys = require "sys"
util = require "util"

TwerpTest = require( "../../lib/twerptest" ).TwerpTest
Runner = require( "../runner" ).Runner

class exports.Tiny extends Runner
  onStartClass: ( classname ) => @classname = classname
  onStartTest: ( testname )   =>
    # strip the test part from the beginning
    if matches = /^test[ _]?(.+)$/.exec testname
      testname = matches[1]

    sys.print " #{@classname}: #{testname}: "

  onEndTest: ( testname, res ) ->
    msg=""

    if res.expected
      colour = if res.expected isnt res.count
        @red
      else
        @green

      msg += " (#{colour res.expected} expected)"

    util.puts "#{msg}."

  onAssertionPass: ( ) => sys.print @green "."
  onAssertionFail: ( e ) =>
    spcr = "\n      "
    errs = e.stack.split( "\n" )
    errs[0] = @red errs[0]

    util.print "#{spcr}#{errs.join( spcr )}"

  onRunEnd: ( summary ) =>
    util.puts "Time taken: #{summary.time}"
    util.puts "Passed:     #{summary.passed}"
    util.puts "Failed:     #{summary.failed}"
