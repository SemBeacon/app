<div style="margin-left: auto; margin-right: auto; width: 80%">
    <img src="https://sembeacon.org/images/logo.svg" width="100%">
</div>

## Description
The SemBeacon application showcases the capabilities of the SemBeacon platform. It provides a comprehensive example of how to integrate and utilize SemBeacon's features for real-time location tracking and data analysis. This application is designed to help developers understand the potential of SemBeacon and how it can be applied to various use cases.

## Production
1. Set the `SIGNING_STORE_PASSWORD`, `SIGNING_KEY_ALIAS`, and `SIGNING_KEY_PASSWORD` environment variables.
2. `npx cap build android --androidreleasetype APK --keystorepath keystore/sembeacon.jks --keystorepass $SIGNING_STORE_PASSWORD --keystorealias $SIGNING_KEY_ALIAS --keystorealiaspass $SIGNING_KEY_PASSWORD` (change with AAB for Google Play Store)

## Contributing
We welcome contributions to improve the SemBeacon application. Please refer to the [Contributing Guide](./CONTRIBUTING.md) for more details.

## License
This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more information.
