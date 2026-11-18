# Guia de Geração de APK (Android)

Este guia descreve o processo para gerar um arquivo APK de produção para o aplicativo PastoralApp.

## Pré-requisitos

Para gerar o APK, você precisa ter instalado em sua máquina:

1.  **Node.js** (versão 18 ou superior)
2.  **Java Development Kit (JDK)** (versão 17 recomendada)
    *   Certifique-se de que a variável de ambiente `JAVA_HOME` está configurada.
3.  **Android Studio** e **Android SDK**
    *   Instale o Android Studio e, através do SDK Manager, instale o "Android SDK Build-Tools" e "Android SDK Platform-Tools".
    *   Certifique-se de que a variável `ANDROID_HOME` (ou `ANDROID_SDK_ROOT`) está configurada.

## Configuração de Assinatura (Release)

Para gerar um APK de produção (Release) que possa ser instalado em dispositivos ou publicado na loja, você precisa assinar o aplicativo.

1.  **Gerar uma Keystore (Chave de Assinatura)**
    Se você ainda não tem uma chave, gere uma executando o seguinte comando no terminal:
    ```bash
    keytool -genkey -v -keystore android/release-key.keystore -alias pastoral-app -keyalg RSA -keysize 2048 -validity 10000
    ```
    Guarde a senha definida e o arquivo `release-key.keystore` em local seguro.

2.  **Configurar Propriedades**
    Crie um arquivo chamado `keystore.properties` dentro da pasta `android/` com o seguinte conteúdo (baseado no exemplo `android/keystore.properties.example`):
    ```properties
    storeFile=release-key.keystore
    storePassword=SUA_SENHA_DA_STORE
    keyAlias=pastoral-app
    keyPassword=SUA_SENHA_DA_CHAVE
    ```
    *Nota: O arquivo `keystore.properties` e `*.keystore` estão configurados no `.gitignore` para não serem enviados ao repositório por segurança.*

## Gerando o APK

Com o ambiente configurado, execute o seguinte comando na raiz do projeto:

```bash
npm run apk:generate
```

Este comando realiza as seguintes etapas automaticamente:
1.  Compila a aplicação web (`vite build`).
2.  Sincroniza os arquivos com o projeto Android (`npx cap sync`).
3.  Executa o Gradle para montar o APK de release (`gradlew assembleRelease`).

## Localização do Arquivo

Após o sucesso do build, o APK gerado estará localizado em:

`android/app/build/outputs/apk/release/`

O nome do arquivo seguirá o padrão:
`app-release-[VERSÃO]-[DATA].apk`
(Exemplo: `app-release-1.0-20250102.apk`)

## Verificação e Instalação

Para testar o APK em um dispositivo conectado via USB:

1.  Ative a Depuração USB no dispositivo Android.
2.  Execute:
    ```bash
    adb install android/app/build/outputs/apk/release/app-release-*.apk
    ```

Para verificar a assinatura (opcional):
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release-*.apk
```
