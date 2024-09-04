---
title: Adopting Dotfiles for Codespaces and DevContainers
date: "2024-09-02"
discussionId: "2024-09-02-dotfiles-codespaces"
redirect_from:
---

Setting up a development environment on a new machine to get
everything just right, is time-consuming.
[Dotfiles repositories](https://github.com/search?q=topic%3Adotfiles&type=repositories) help a
lot with this. They allow us to maintain consistent configurations
across different machines, saving us a lot of time and effort.

Dotfiles repositories are incredibly handy. They keep your setup
consistent across different machines, save you tons of time when
setting up new systems, and allow you to track changes with version
control. Also, sharing your dotfiles with coworkers and friends supports
learning within the community.


DevContainers and CodeSpaces are also great for maintaining
project-specific development environments and collaborating with
others. [DevContainers](https://containers.dev/) provide isolated and consistent environments made
specifically for the needs of an indivual project, making sure everyone 
with the same setup.  Also, they attempt to solve a problem of conflicting
dependencies across different projects. This reduces the "it works on my machine"
problem and streamlines the onboarding process for new developers. [Codespaces](https://github.com/features/codespaces) and similar
products take this a step further by providing a cloud-based development environment that
runs DevContainers and where everyone can collaborate in a shared space.

Using both DevContainers and dotfiles together provides the best of both worlds. 
DevContainers ensure that your development environment is consistent, isolated, and 
tailored specifically to the project. Dotfiles allow each developer to customize the
shared devcontainer according to their individual preferences. Many of the tools and
environments can be configured to apply your personal dotfiles repository after the
container is provisioned.

DevContainers handle dotfiles differently than traditional workstations.
Typically, workstations use separate repositories for the dotfile
manager and the dotfiles themselves. Tools like
[Chezmoi](https://www.chezmoi.io/) or [@dcreager's
dotfiles-base](https://github.com/dcreager/dotfiles-base) manage
and sync dotfiles, with the assumption that they are cloned into the users' home directory.
However, DevContainers support only a single repository containing both
the manager and the dotfiles, which is often cloned into a non-home directory.
This is why you need a container-specific dotfiles repository.


Here is my attempt to adopt the [@dcreager's dotfiles-base](https://github.com/dcreager/dotfiles-base) for the use with Codespaces and DevContainers. You can find the repository [here](https://github.com/vladistan/dotfiles-codespaces).

This setup is useful if you have an existing dotfiles setup based
on the [dcreager dotfiles
manager](https://github.com/dcreager/dotfiles-base/) Such as one
of the ones below:

- [dcreager dotfiles-base](https://github.com/dcreager/dotfiles-public)
- [vladistan dotfiles-public](https://github.com/vladistan/dotfiles-public)
- [rouge8 dotfiles](https://github.com/rouge8/dotfiles)
- [cpaulik dotfiles](https://github.com/cpaulik/dotfiles)

This container-specific dotfiles repo addresses both issues by combining the management script and the dotfiles into a single monorepo and being flexible with the location it's cloned into.

## You problably don't need this one

If you don't have a dotfiles repository or yours is not based on dcreager's dotfiles-base, you probably don't need this one. 

For new setups I recommend using more modern tool  like
[chez-moi](https://www.chezmoi.io/) that has a DevContainer
[feature](https://github.com/rio/features/tree/main/src/chezmoi)

Alternatively, for a simpler container-only setup, you should read
a great guide by Bea Stollnitz on [codespaces terminal
setup](https://bea.stollnitz.com/blog/codespaces-terminal/).


## How to get started

1. [Fork](https://github.com/vladistan/dotfiles-codespaces/fork) the repo
2. Modify files in the [dotfiles folder](https://github.com/vladistan/dotfiles-codespaces/tree/main/dotfiles) according to your preferences
3. [Configure](#dotfiles-in-containers) your environment to use the repo
4. PROFIT!

## Caution

Usual warning, remember, dotfile repositories are public, so avoid putting any API keys, passwords, or personal info in them. Use proper secret storage methods to handle these things. Also it's a good
idea to use tools like [gitleaks](https://github.com/zricethezav/gitleaks) to detect if secrets are accidentally committed into the source control. Even better is to set up a [pre-commit hook](https://pre-commit.com/) to prevent it, like the one [here](https://github.com/vladistan/dotfiles-codespaces/blob/031d362f3f05c442d8da45e8c6f436a0b147f7c1/.pre-commit-config.yaml#L61).

