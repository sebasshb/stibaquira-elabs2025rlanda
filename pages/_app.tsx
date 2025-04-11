import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import { useEffect } from 'react';

// Creamos un tipo personalizado que excluye la propiedad 'ssr'
type AmplifyConfig = Omit<typeof awsExports, 'ssr'>;

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Configura Amplify solo en el lado del cliente
    try {
      // Creamos un nuevo objeto sin la propiedad 'ssr'
      const config: AmplifyConfig = {
        aws_project_region: awsExports.aws_project_region,
        aws_cognito_identity_pool_id: awsExports.aws_cognito_identity_pool_id,
        aws_cognito_region: awsExports.aws_cognito_region,
        aws_user_pools_id: awsExports.aws_user_pools_id,
        aws_user_pools_web_client_id: awsExports.aws_user_pools_web_client_id,
        oauth: awsExports.oauth,
        aws_cognito_username_attributes: awsExports.aws_cognito_username_attributes,
        aws_cognito_social_providers: awsExports.aws_cognito_social_providers,
        aws_cognito_signup_attributes: awsExports.aws_cognito_signup_attributes,
        aws_cognito_mfa_configuration: awsExports.aws_cognito_mfa_configuration,
        aws_cognito_mfa_types: awsExports.aws_cognito_mfa_types,
        aws_cognito_password_protection_settings: awsExports.aws_cognito_password_protection_settings,
        aws_cognito_verification_mechanisms: awsExports.aws_cognito_verification_mechanisms,
        aws_appsync_graphqlEndpoint: awsExports.aws_appsync_graphqlEndpoint,
        aws_appsync_region: awsExports.aws_appsync_region,
        aws_appsync_authenticationType: awsExports.aws_appsync_authenticationType,
        aws_appsync_apiKey: awsExports.aws_appsync_apiKey
      };
      
      Amplify.configure(config);
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;