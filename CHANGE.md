# Kicket Changes

## (07-12-2020)

- Fix issue where transport transforms were not unique.

## (06-14-2020)

- Deprecated "addTransport", Transports should be added on init, if needed create new Logger.
- Added simple internal logger for user feedback.
- Improve default ConsoleTransport.
- Improve typings.
- Include RemoveTransport method.
- Add helper methods for building filers and transforms.
- Allow applying transform or filter to specific Transport (can also do in transform or filter itself)
- Allow type of any as message instead of just string duh.....

## (06-13-2020)

- Expose write and writeLn to transform/filters instead of "*".
- Fix child logger issues.
- Add emitter for log:level.
- Add group writer.
- Add additional log emitters log, log:end, log:[level], log:[level]:end.

## (04-07-2020)

- Change log in descending chronological order.

## (04-07-2020)

- update typings
- change writer to use async when writing to each transport.

## (03-12-2020)

- Initial commit