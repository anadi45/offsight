#!/bin/bash
APP_NAME="offsight"
BUNDLE_ID="com.offsight.app"

echo "Creating clean RN template..."
npx @react-native-community/cli init ${APP_NAME}Template --package-name "${BUNDLE_ID}" --skip-install

echo "Removing old native folders..."
rm -rf ios android

echo "Copying fresh native folders..."
cp -R ${APP_NAME}Template/ios ./ios
cp -R ${APP_NAME}Template/android ./android

echo "Cleaning template project..."
rm -rf ${APP_NAME}Template

echo "Installing pods..."
cd ios && pod install && cd ..

echo "Done! Fresh native folders generated."
