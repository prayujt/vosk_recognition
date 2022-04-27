#!/usr/bin/env python3
import os
import sys
from word2number import w2n

def __main__():
    string = sys.argv[1]
    words = string.split(' ')

    direction_switch = {
        'left': 'west',
        'right': 'east',
        'riot': 'east',
        'up': 'north',
        'down': 'south'
    }

    command = ''
    if (words[0] == 'focus' or words[0] == 'select') and (words[1] == 'window' or words[1] == 'node'):
        command = 'bspc node -f {0}'.format(direction_switch.get(words[2]))

    elif (words[0] == 'switch' or words[0] == 'move') and (words[1] == 'window' or words[1] == 'node'):
        command = '/home/prayuj/.config/sxhkd/move {0}'.format(direction_switch.get(words[2]))

    elif words[0] == 'open' or words[0] == 'spawn':
        command = '{0} &'.format(words[1])
    
    elif 'volume' in words:
        index = words.index('volume')
        if index > 0:
            changeType = words[index - 1]
            if changeType == 'set':
                command = 'pactl set-sink-volume 2 {0}%'.format(w2n.word_to_num(' '.join(words[index+1:])))
            elif changeType == 'increase':
                command = 'pactl set-sink-volume 2 +{0}%'.format(w2n.word_to_num(' '.join(words[index+1:])))
                pass
            elif changeType == 'decrease':
                command = 'pactl set-sink-volume 2 -{0}%'.format(w2n.word_to_num(' '.join(words[index+1:])))

    if command != '':
        os.system(command)

if __name__ == '__main__' and len(sys.argv) == 2:
    __main__()
