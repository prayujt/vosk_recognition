#!/usr/bin/env python3
import os
import sys

def __main__():
    args = []

    for i in range(1, len(sys.argv)):
        args.append(sys.argv[i])
    string = ' '.join(args)

    direction_switch = {
        'left': 'west',
        'right': 'east',
        'riot': 'east',
        'up': 'north',
        'down': 'south'
    }

    command = ''
    if (args[0] == 'focus' or args[0] == 'select') and (args[1] == 'window' or args[1] == 'node'):
        command = 'bspc node -f {0}'.format(direction_switch.get(args[2]))

    elif (args[0] == 'switch' or args[0] == 'move') and (args[1] == 'window' or args[1] == 'node'):
        command = '/home/prayuj/.config/sxhkd/move {0}'.format(direction_switch.get(args[2]))

    if command != '':
        os.system(command)

if __name__ == '__main__':
    __main__()
