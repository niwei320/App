import React, {Component} from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    Animated
} from 'react-native'
import PropTypes from 'prop-types';
export default class ExpandableView extends Component {
    static propTypes = {
        expanded: PropTypes.bool,
        title: PropTypes.string,
        onToggle: PropTypes.func
    }

    static defaultProps = {
        expanded: false
    }

    constructor(props) {
        super(props)
        this.isFirstTime = true;
        this.state = {
            expanded: false,
            animation: new Animated.Value()
        }
    }

    log() {
        console.log('调用了')
    }

    toggle(bool) {
        const {onToggle} = this.props
        const {maxHeight, minHeight, animation} = this.state
        const initialValue = bool ? minHeight + maxHeight : minHeight
        const finalValue = bool ? minHeight : minHeight + maxHeight
        this.setState({expanded: bool})
        animation.setValue(initialValue)
        Animated.timing(animation, {
            toValue: finalValue,
            duration: 200
        }).start()
        onToggle()
    }

    render() {
        const {animation, maxHeight} = this.state
        return (
            <Animated.View style={[styles.container, {height: animation}]}>
                <View style={styles.titleContainer}
                      onLayout={event => this.setState({minHeight: event.nativeEvent.layout.height})}>
                    <Text style={styles.title}>{this.props.title}</Text>
                </View>
                <View style={styles.body}
                      onLayout={event => !maxHeight && this.setState({maxHeight: event.nativeEvent.layout.height})}>
                    {this.props.children}
                </View>
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row'
    },
    title: {
        flex: 1,
        color: '#2a2f43',
        fontWeight: 'bold'
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonImage: {
        width: 25,
        height: 20
    },
    body: {
        paddingTop: 0
    }
});