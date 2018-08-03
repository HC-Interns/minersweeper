import * as React from 'react';
import { connect } from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { Action, ActionType } from '../../../minesweeper';

import './Chatbox.css';

import {Hash} from '../../../holochain';

import Jdenticon from './Jdenticon';

import { fetchJSON } from '../common';
import store from '../store';

type ChatProps = {
  gameHash: Hash,
  agentHash: Hash,
  rowIndex: number,
  style: any,
  chat: any,
}

class Chatbox extends React.Component<ChatProps, any> {
    constructor(props){
      super(props);
      this.state = {
        id: 2,
        messages: [
          {id: 0, authorName: 'Will', text: 'Hi!'},
          {id: 1, authorName: 'Joel', text: 'Hello!'}
        ]
      };
    }

    public handleMessage = (authorName, text) => {
      this.setState({
        messages: this.state.messages.concat(
          {id: +1, authorName, text}
        )
      });
    };

    public render() {
      return(
        <div className='chat-box'>
          <MessagesList messages={this.state.messages} />
          <InputForm handleMessage={this.handleMessage} />
        </div>
      )
    }
  }

class MessagesList extends React.Component<any, any> {
  public render() {
      return(
        <ReactCSSTransitionGroup
          className='messages-field'
          transitionName = 'message'
          transitionEnterTimeout = {500}
          transitionAppear={true}
          transitionAppearTimeout={500}>
        {this.props.messages.map(msg => {
          return (
            <div key={msg.id}>
              <Message id={msg.id} authorName={msg.authorName} text={msg.text} />
            </div>
          )
        })}
        </ReactCSSTransitionGroup>
      )
    }
  }

class Message extends React.Component<any, any> {
  private messageField: React.RefObject<any>  = React.createRef()

  constructor(props){
    super(props);
  }

   public componentDidMount() {
     if(this.messageField.current){
       this.messageField.current!.scrollIntoView();
     }
    }
   public render() {
      return(
        <div ref={this.messageField} className='single-message-field'>
          <h5 className='messageAuthorName'>{this.props.authorName}</h5>
          <span className='messageText'>{this.props.text}</span>
        </div>
      )
    }
  }

  class InputForm extends React.Component<any, any> {
    private authorName: React.RefObject<any> = React.createRef()
    private text: React.RefObject<any> = React.createRef()

    constructor(props){
      super(props);
      this.onClickBtnClear = this.onClickBtnClear.bind(this);
      this.onClickBtnSend = this.onClickBtnSend.bind(this);
    }

    public onClickBtnSend = () => {
      const authorName = this.authorName.current.value;
      const text = this.text.current.value;
      if (authorName.length < 15 && authorName.length && text.length){
        this.props.handleMessage(authorName, text);
      }
    };
    public onClickBtnClear = () => {
      this.text.current.value = '';
    };

    public render() {
      return(
        <div className='inputField'>
          <input className='inputName' type='text' placeholder='Username' defaultValue='' ref={this.authorName}/>
          <textarea className='inputText' placeholder='Message' defaultValue='' ref={this.text}/>
          <div className='inputButtons'>
            <button className='inputButtonSend' onClick={this.onClickBtnSend}>Send</button>
            <button className='inputButtonClear' onClick={this.onClickBtnClear}>Clear</button>
          </div>
        </div>
      )
    }
  }

export default connect(state => ({myActions: state.myActions}))(Chatbox);
