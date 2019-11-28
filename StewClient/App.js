import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator} from 'react-native';
import Constants from 'expo-constants';
import * as startup from "./components/startup";
import * as WebBrowser from 'expo-web-browser';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: Constants.statusBarHeight,
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 16,
	},
	title: {
		fontSize: 30,
		textAlign: 'center',
		margin: 10,

	},
	wait: {
		flex: 1,
		padding: 20,
		margin: 40
	},
	item: {
		padding: 10,
		fontSize: 18,
		height: 44,
	},
	button: {
		flex: 1,
		margin: 10,
		padding: 10,
		width: "40%",
	}
});

export default class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			stews: [],
		};
	}

	async componentDidMount() {

		const stews = await this.getStews();

		this.setState({
			isLoading: false,
			stews,
		});
	}
		render() {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Die nächsten Eintöpfe gibt es am:</Text>
					{this.state.isLoading ? <ActivityIndicator style={styles.wait}/> : 
					<FlatList data={this.state.stews} keyExtractor={item =>  item.datestring} renderItem={({item}) => <Text style={styles.item}> {item.datestring} </Text>}/>
					}
					<Button style={styles.button}
						onPress={startup.default}
						title="Rerun startup!"
						color="#841584"
					/>
					<Button style={styles.button}
						onPress={this.openDaVinci}
						title="Speiseplan"
						color="#841584"
					/>
				</View>
			);
		}

	async getStews () {
		const response = await fetch('https://stew.felixhummel.me/stews', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.json();
	}

	async openDaVinci() {
		await WebBrowser.openBrowserAsync('https://www.stw-muenster.de/de/essen-trinken/mensen/da-vinci/#speiseplan');
	}

	}




