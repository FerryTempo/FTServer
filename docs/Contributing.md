# Contributing to FTServer

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

If you like the Ferry Tempo project, but just don't have time to contribute, that's fine. There are other easy ways to support us and show your appreciation, which we would also be very happy about:
- Star the project
- Tell others about it
- Mention the project at local meetups and tell your friends/colleagues
- Share it with fellow passengers on your next ferry ride

For more information, be sure to check out the [official GitHub documentation](https://docs.github.com).

## Code of Conduct

This project and everyone participating in it is governed by the [FTServer Code of Conduct](https://github.com/FerryTempo/FTServer/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Reporting Bugs

### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://github.com/FerryTempo/FTServer/blob/main/README.md). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/FerryTempo/FTServer/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
- Can you reliably reproduce the issue? And can you also reproduce it with older versions?

### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to [mr@alexmarc.us](mr@alexmarc.us).

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/FerryTempo/FTServer/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

## Your First Contribution
Contributing code for the first time can be intimidating. By following these instructions, you can be sure that your contribution will be well-received and helpful.

*Note: This guide applies both for code and documentation improvements. Any change to the FTServer repository should follow these steps.*

1. Find an issue or feature to work on in the [issues](https://github.com/FerryTempo/FTServer/issues) or [project](https://github.com/orgs/FerryTempo/projects/5) view. For example, [ Add Contribution guidelines document #31](https://github.com/FerryTempo/FTServer/issues/31). See [About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues) for more information on issue tracking.
1. (Assign the issue)[https://docs.github.com/en/issues/tracking-your-work-with-issues/assigning-issues-and-pull-requests-to-other-github-users] to yourself and mark its status as in-progress.
1. Run the code on your local machine by following the [README instructions](https://github.com/FerryTempo/FTServer/blob/main/README.md).
1. Check out a new branch from the latest `main` with a naming convention that aligns with the issue number and change being made. For example, `git checkout -b 31-documentation-docs`.
1. Make the code changes locally and validate your changes with manual testing. Note that the code in this repository must adhere to [ESLint](https://eslint.org/) style standards.
1. Add any relevant unit tests to the [test/](./test) directory, following the available patterns for unit testing.
1. Run tests with `npm run test` and fix any failed tests.
1. Commit your changes with a relevant commit message. For example, `git commit -m "Adds documentation for contributors."`.
1. Push your branch to the origin repository. For example, `git push --set-upstream origin 31-contribution-docs`.
1. Open a new [Pull Request](https://github.com/FerryTempo/FTServer/pulls). Pull requests should have a title which briefly describes the change. The Pull Request description should detail what the change does, and how it has been tested. Be sure to [link your Pull Request to your issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) by referencing the issue number in the Pull Request description. For example: "This PR resolves #31."
1. Once the pull request is opened, it will need to be reviewed by a [Ferry Tempo development team](https://github.com/orgs/FerryTempo/teams/ferry-tempo-devs) member. Once it is reviewed and any automated tests pass, it can be merged into the `main` branch.
1. That's it! Once your PR merges, the associated issue with automatically be closed. Thanks for the help!

### Attribution
This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!