import React from "react";
import {Text} from "react-native";
import { View, Button } from "native-base";

import styles from "./bookbuttonstyle.js";

export const bookbutton = ({onPressAction})=>{
	return (
		<Button style={styles.bookbuttonContainer} onPress={onPressAction}>
			<Text style={styles.btnText}> Book </Text>
		</Button>

	);
}

export default  Fab;