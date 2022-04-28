#!/usr/bin/env python3
import os
import sys
from word2number import w2n

def __main__():
    string = sys.argv[1]
    sink = sys.argv[2]
    words = string.split(' ')

    direction_switch = {
        'left': 'west',
        'right': 'east',
        'riot': 'east',
        'up': 'north',
        'down': 'south'
    }

    command = ''
    if (words[0] == 'focus' or words[0] == 'focused' or words[0] == 'select'):
        if words[1] == 'window' or words[1] == 'node':
            command = 'bspc node -f {0}'.format(direction_switch.get(words[2]))
        elif words[1] == 'desktop' or words[1] == 'screen':
            if words[2] == 'too':
                words[2] = 'two'
            command = 'bspc desktop -f ^{0}'.format(w2n.word_to_num(words[2]))
    elif (words[0] == 'switched' or words[0] == 'switch') and (words[1] == 'desktop' or words[1] == 'screen'):
        if words[2] == 'too':
            words[2] = 'two'
        command = 'bspc desktop -f ^{0}'.format(w2n.word_to_num(words[2]))
    elif (words[0] == 'switched' or words[0] == 'switch' or words[0] == 'move' or words[0] == 'moved') and (words[1] == 'window' or words[1] == 'node'):
        if words[2] == 'desktop' or words[2] == 'screen':
            if words[3] in direction_switch:
                command = '/home/prayuj/.config/sxhkd/move {0}'.format(direction_switch.get(words[3]))
            else:
                if words[3] == 'too':
                    words[3] = 'two'
                command = 'bspc node -d ^{0}'.format(w2n.word_to_num(words[3]))
        else:
            command = '/home/prayuj/.config/sxhkd/move {0}'.format(direction_switch.get(words[2]))

    elif words[0] == 'open' or words[0] == 'spawn':
        command = '{0} &'.format(words[1])
    
    elif 'mute' in words:
        command = 'pactl set-sink-volume {0} 0%'.format(sink)
    elif 'volume' in words:
        index = words.index('volume')
        if index > 0:
            changeType = words[index - 1]
            if changeType == 'set':
                command = 'pactl set-sink-volume {0} {1}%'.format(sink, w2n.word_to_num(' '.join(words[index+1:])))
            elif changeType == 'increase':
                command = 'pactl set-sink-volume {0} +{1}%'.format(sink, w2n.word_to_num(' '.join(words[index+1:])))
            elif changeType == 'decrease' or changeType == 'lower':
                command = 'pactl set-sink-volume {0} -{1}%'.format(sink, w2n.word_to_num(' '.join(words[index+1:])))

    elif words[0] == 'quit' or words[0] == 'close' or words[0] == 'exit':
        command = 'bspc node -c'

    if command != '':
        os.system(command)

if __name__ == '__main__' and len(sys.argv) == 3:
    __main__()
