import { ReactNode, useContext, useState } from 'react';
import { Text, View } from "react-native";
import { Appbar, Divider, Menu } from "react-native-paper";
import { baseStyles } from "../../../styles/base.styles";
import { INavigation, RootStackParamList } from "@router";
import { DataContext } from '@components/providers/DataProvider';

interface IHeaderProps {
    title?: string
    additional?: ReactNode
    navigation: INavigation
}

export default function Header({ navigation, additional, title = "" }: IHeaderProps) {

    const [visible, setVisible] = useState(true);

    const { data } = useContext(DataContext);

    const closeMenu = () => setVisible(false);
    const openMenu = () => setVisible(true);

    const handlePress = (screenName: any, props?: any) => {
        if (props) {
            navigation.navigate(screenName, props)
        }
        else {
            navigation.navigate(screenName)
        }

        setVisible(false)
    }

    return (
        <Appbar.Header style={baseStyles.header}>
            <Appbar.Content title={title} />
            {additional && additional}
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Appbar.Action icon="menu" onPress={openMenu} />}
            >
                <Menu.Item
                    onPress={() => handlePress("Settings")}
                    title="Настроить список"
                />
                <Divider />
                {data.map(d => <Menu.Item
                    key={d.id + d.deviceid}
                    onPress={() => handlePress("Stand", d)}
                    title={`${d.name} ${d.deviceid}`}
                />)}
            </Menu>
        </Appbar.Header>
    )
}
