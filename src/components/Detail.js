import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import '../index.css';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import UpdateIcon from '@material-ui/icons/Update';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const databaseURL = "https://word-cloud-81410.firebaseio.com";
const apiURL = "http://localhost:5000";

const styles = theme => ({
    fab: {
        position: 'fixed',
        bottom: '20px',
        right: '20px'
    }
})

class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialog: false,
            textContent: '',
            words: {},
            imageUrl: null,
            maxCount: 30,
            minLength: 1
        }
    }
    componentDidMount() {
        this._getText();
        this._getWords();
        this._getImage();
    }

    // Texts.js (부모) 156번째 라인: to={ "detail/" + id }> 
    // id = this.props.match.params.textID
    
    _getText() {
        fetch(`${databaseURL}/texts/${this.props.match.params.textID}.json`).then( res => {
            if(res.status != 200) {
                throw new Error(res.statueText);
            }
            return res.json();
        }).then(text => this.setState({textContent : text['textContent']}));
    }

    _getWords() {
        fetch(`${databaseURL}/words.json`).then( res => {
            if(res.status != 200) {
                throw new Error(res.statueText);
            }
            return res.json();
        }).then(words => this.setState({words : (words == null) ? {} : words}));
    }

    _getImage() {
        fetch(`${apiURL}/validate?textID=${this.props.match.params.textID}`).then( res => {
            if(res.status != 200) {
                throw new Error(res.statueText);
            }
            return res.json();
        }).then(data => {
            if(data['result'] == true) {
                this.setState({imageUrl: apiURL + "/outputs?textID=" + this.props.match.params.textID})
            }
            else {
                this.setState({imageUrl: 'NONE'})
            }
        });
    }

    handleDialogToggle = () => this.setState({
        dialog: !this.state.dialog
    })

    handleSubmit = () => {

        this.setState({imageUrl: 'READY'});

        // POST 방식으로 보낼 데이터의 '종류' 지정 
        const wordCloud = {
            // 크롬 Restlet 에서 보내주는 이름 이랑 동일하게 맞춰 주었다. (그냥)
            textID: this.props.match.params.textID,
            text: this.state.textContent,
            maxCount: this.state.maxCount,
            minLength: this.state.minLength,
            words: this.state.words
        }

        this.handleDialogToggle();

        if(!wordCloud.textID ||
            !wordCloud.text ||
            !wordCloud.maxCount ||
            !wordCloud.minLength ||
            !wordCloud.words) {
                return;
            }
        this._post(wordCloud)
    }

    _post = (wordCloud) => {
        fetch(`${apiURL}/process`, {
            method: 'POST',     // POST 방식으로 OO경로에 데이터를 보낸다
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wordCloud)
        }).then( res => {
            if(res.status != 200) {
                throw new Error(res.statueText);
            }
            return res.json();
        }).then(data => {
            this.setState({imageUrl: apiURL + "/outputs?textID=" + this.props.match.params.textID})
        });
    }

    handleValueChange = (e) => {
        let nextState = {};
        if(e.target.value % 1 === 0) { // 숫자 일때만 
            if(e.target.value < 1) {
                nextState[e.target.name] = 1;
            }
            else {
                nextState[e.target.name] = e.target.value
            }
        }
        this.setState(nextState);
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <Card>
                    <CardContent>
                        {
                            (this.state.imageUrl)?
                                ((this.state.imageUrl == 'READY')?
                                    '워드 클라우드 이미지를 불러오는 중입니다.':
                                    ((this.state.imageUrl == 'NONE')?
                                        '해당 텍스트에 대한 워드 클라우드를 만들어 주세요.':
                                        <img key={Math.random()} src={this.state.imageUrl + '&random=' + Math.random()} style={{width: '100%'}}/>)):
                            ''       
                        }
                    </CardContent>
                </Card>
                <Fab color="primary" className={classes.fab} onClick={this.handleDialogToggle}>
                    <UpdateIcon />
                </Fab>
                <Dialog open={this.state.dialog} onClose={this.handleDialogToggle}>
                    <DialogTitle>워드 클라우드 생성</DialogTitle>
                    <DialogContent>
                        <TextField label="최대 단어 개수" type="number" name="maxCount" value={this.state.maxCount} onChange={this.handleValueChange} /><br />
                        <TextField label="최소 단어 길이" type="number" name="minLength" value={this.state.minLength} onChange={this.handleValueChange} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                            {(this.state.imageUrl == 'NONE') ? '만들기': '다시 만들기'}
                        </Button>
                        <Button variant="outlined" color="primary" onClick={this.handleDialogToggle}>
                            닫기
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(Detail);