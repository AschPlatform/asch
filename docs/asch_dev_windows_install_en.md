# Setup Local Asch Development Environment (Windows)

<!-- TOC -->

- [Setup Local Asch Development Environment (Windows)](#setup-local-asch-development-environment-windows)
  - [1 System Requirements](#1-system-requirements)
  - [2 Install node.js](#2-install-nodejs)
  - [3 Install Python](#3-install-python)
    - [Common Problem: Python can't be found](#common-problem-python-cant-be-found)
    - [Test Python Installation](#test-python-installation)
  - [4 Install .NET Framework 4.5.1](#4-install-net-framework-451)
  - [5 Install VC++ Build Tools Technical Preview](#5-install-vc-build-tools-technical-preview)
  - [6 Install git](#6-install-git)
  - [7 Install sqlite3](#7-install-sqlite3)
  - [8 Install MinGW (gcc, g++)](#8-install-mingw-gcc-g)
  - [10 Install OpenSSL](#10-install-openssl)
    - [Info](#info)
  - [11 Clone Asch Blockchain](#11-clone-asch-blockchain)
  - [12 Run the code](#12-run-the-code)
  - [13 Compile the front-end project](#13-compile-the-front-end-project)

<!-- /TOC -->


## 1 System Requirements

- Windows (7/8/10)

## 2 Install node.js
Install node.js version 6.3 or later.  
[Download node.js](https://nodejs.org/en/download/)

![node](./assets/win_install/node_en.PNG)

## 3 Install Python
Install version 2.5 up to 3.0. Python version v2.7 is preferred. Version v3.0 and above are not supported.  
[Download Python 2.7.13](https://www.python.org/downloads/release/python-2713/) 


### Common Problem: Python can't be found

Often can python not be found from the command line after the installation:  
![python](./assets/win_install/python_not_found_en.PNG)

Open the windows `Control Panel`  
![python](./assets/win_install/control_panel_system_variables_en.PNG)

Select `Environment Variables`:  
![env-var](./assets/win_install/environment_variables_menu_en.PNG)

Edit `%PATH%`:  
![env-var](./assets/win_install/env_variables_select_path_en.PNG)

Add new Environment Variable:  
![env-variable](./assets/win_install/env_variables_new_en.PNG)

Python is normally installed in `C:\Python27`.  
![python](./assets/win_install/python_location_en.PNG)

Add `C:\Python27\` to the Environment Variables:  
![python27](./assets/win_install/env_variables_new_python_en.PNG)



### Test Python Installation

Be sure to __restart__ your system before testing if it works.

![python](./assets/win_install/python_success_en.PNG)


## 4 Install .NET Framework 4.5.1

If the .NET Version 4.5 or higher is already installed ignore this step. On windows 10 .NET 4.5 is already installed.  
[Download .NET 4.5](https://www.microsoft.com/en-us/download/details.aspx?id=42779) 

Check if the `.NET 4.5`   is already installed:
* Open: Control Panel  
* Click: Programs  
* Click: Turn Windows features on or off  

![python](assets/win_install/win10.net_en.PNG)

## 5 Install VC++ Build Tools Technical Preview

Install the VC++ Build Tools Technical Preview. Choose the __custom__ installation.  
[Download](http://go.microsoft.com/fwlink/?LinkId=691126)  

![vs](./assets/win_install/vc_custom.PNG)

Select:  
* __Windows 8.1 SDK__  
* __Windows 10 SDK__  

![vs](./assets/win_install/vc_win8_win10.PNG)

The installation can take up to 10 minutes.

Set in `npm` the Visual Studio Version to __2015__
```cmd
npm config set msvs_version 2015
```

![vs](./assets/win_install/vc_set_msvs_version_2015.PNG)

[Reference](https://stackoverflow.com/questions/21069699/node-packages-not-building-on-windows-8-1-missing-microsoft-cpp-default-props)


## 6 Install git
 Download and install git. 
 You need to select `git bash console`.  
[Download git](https://git-scm.com/download/win)

Install Git Bash:  
![git](./assets/win_install/git_install_git_bash.PNG)

Git use Windows Command Prompt:  
![git](./assets/win_install/git_option.PNG)

Select Git OpenSSL Version:  
![git](./assets/win_install/git_openssl.PNG)

Use Windows default console:  
![git](./assets/win_install/git_install_cmd.PNG)







## 7 Install sqlite3
[Download](https://sqlite.org/2018/sqlite-tools-win32-x86-3240000.zip)  

Unzip the zip archive  
![sqlite3](./assets/win_install/sqlite_extract_zip.PNG)

Create new directory `C:\sqlite3`  
![sqlite3](./assets/win_install/sqlite_new_dir_content.PNG)

Edit `%PATH%`:  
![env-var](./assets/win_install/env_variables_select_path_en.PNG)

![sqlite3](assets/win_install/sqlite_env_variable.PNG)

Be sure to __restart__ your PC for the following command to work.  
Open the command line to verify the sqlite installation:

![sqlite3](./assets/win_install/sqlite3_success.PNG)

## 8 Install MinGW (gcc, g++)
Install MinGW from Sourceforge. The installation can take up to 10 minutes:  
* [download mingw-setup](https://sourceforge.net/projects/mingw/files/Installer/)

Download from Sourceforge:  
![mingw](./assets/win_install/mingw_sourceforge.PNG)

Setup:  
![mingw](./assets/win_install/mingw_setup.PNG)

Apply Changes:  
![mingw](./assets/win_install/mingw_apply_changes.PNG)

Edit `%PATH%`:  
![env-var](./assets/win_install/env_variables_select_path_en.PNG)

Àdd the environment variable `C:\MinGW\bin\`:  
![mingw](./assets/win_install/mingw_env_variable.PNG)


Be sure to __restart__ your system in order for the following commands to work:  
```cmd
gcc -v
g++ -v
```

As follows:

![sqlite3](assets/win_install/gcc_gplusplus_en.PNG)


## 10 Install OpenSSL

Install OpenSSL.  
[Download](http://slproweb.com/products/Win32OpenSSL.html)  

Select correct version:  
![openssl-download](./assets/win_install/openssl_download_en.PNG)

Choose Installation option:  
![openssl-installation](./assets/win_install/openssl_installation.PNG)

__Restart__ your PC in order for OpenSSL to work correctly.

### Info
Unfortunately due to a bug in in the npm package [ed25519](https://github.com/dazoe/ed25519) is it not possbile that we use the newest OpenSSL version (newest: `OpenSSL v1.1.0h`). Therefore we need to go with the older OpenSSL version `OpenSSL v1.0.2o`.

## 11 Clone Asch Blockchain

Clone the Asch Blockchain into an empty directory.
```cmd
git clone https://github.com/aschplatform/asch
```

## 12 Run the code
> Check whether the previous VC++ Build Tools Technical Preview has been installed before running

We need to change a few lines of code in order for the blockchain to work on windows.

* __Option 1__  
  Change the content of package.json
  package.json
  ```
  ## before
  "sodium": "^2.0.3"

  ## change sodium version to 2.0.1
  "sodium": "2.0.1"
  ```


* __Option 2__

  Modify the contents of the following two files:

  * src\utils\ed.js
  * package.json

  package.js:
  ```js
  ## originally relied on
  "sodium": "^2.0.3",

  ## Change to ed25519
  "ed25519": "^0.0.4",
  ```

  ed.js:
  ```js
  ## Replace all the contents of the file with the following code
  const ed = require('ed25519');
  module.exports = {
      MakeKeypair: ed.MakeKeypair,

      Sign: ed.Sign,

      Verify: ed.Verify
  };
  ```

After __Option1__ or __Option2__ install the dependencies:
```cmd
npm install
```




Because of the Windows console, there could be a pause during installation. Maybe you have to press Enter several times. If the following steps appear, it means that the previous installation steps were successful:

![install](assets/win_install/install_en.PNG)

Finally, execute **node app.js** to start the blockchain, as shown in the following figure:

![run](assets/win_install/run_en.PNG)


[Reference node-gyp problem](https://github.com/nodejs/node-gyp/issues/629#issuecomment-153196245)


## 13 Compile the front-end project
The following commands need to be executed in **git bash** in a __new__ console. The first console is already busy with running the blockchain.  
Execute the following commands in order:

```bash
# change directory
cd pubilc
```

Install the dependencies for the frontend application
```bash
npm install yarn --global
npm install browserify --global
npm install gulp --globalg

yarn install
```

Build the frontend application for the localnet.
```bash
gulp build-local
```
